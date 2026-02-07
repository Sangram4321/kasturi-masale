const crypto = require("crypto");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");
const { buildOrderPlacedLink, buildStatusWhatsAppLink } = require("./whatsapp.service");
const { refundPayment } = require("./razorpay.service");
const AuditLog = require("../models/AuditLog");
const WebhookLog = require("../models/WebhookLog");
const emailService = require("./email.service");
const alertService = require("./alert.service");

// Secret from Dashboard
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

exports.handleRazorpayWebhook = async (rawBody, signature) => {
    const startTime = Date.now();

    // 1. Verify Signature (Using Raw Body Buffer)
    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        console.error("❌ WEBHOOK: Invalid signature");
        throw new Error("Invalid Webhook Signature");
    }

    // Parse the body after verification
    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;

    console.log(`🪝 WEBHOOK: Received ${event} at ${new Date().toISOString()}`);

    // 2. Handle payment.captured event
    if (event === "payment.captured") {
        const data = payload.payload.payment.entity;
        const paymentId = data.id;

        // --- 🧪 CRASH-SAFE TEST PAYMENT RECONCILIATION ---
        if (data.notes && data.notes.type === "TEST_PAYMENT") {
            console.log("🪝 🧪 TEST PAYMENT WEBHOOK CAPTURED:", paymentId);

            // Check if already refunded (idempotency)
            const alreadyProcessed = await AuditLog.findOne({
                action: { $in: ["TEST_PAYMENT_SUCCESS_REFUNDED", "TEST_PAYMENT_WEBHOOK_REFUNDED"] },
                resource: `Payment ${paymentId}`
            });

            if (alreadyProcessed) {
                console.log("⏭️ Test payment already refunded, skipping.");
                return;
            }

            // Trigger Fallback Refund
            try {
                const refundResult = await refundPayment(paymentId, 1); // ₹1

                await AuditLog.create({
                    adminId: data.notes.adminId,
                    action: "TEST_PAYMENT_WEBHOOK_REFUNDED",
                    resource: `Payment ${paymentId}`,
                    details: {
                        razorpay_order_id: data.order_id,
                        refundId: refundResult.id,
                        reason: "Webhook Fallback"
                    }
                });
                console.log("✅ Webhook Fallback Refund Successful:", refundResult.id);
            } catch (refundErr) {
                console.error("❌ Webhook Fallback Refund Failed:", refundErr);
                await AuditLog.create({
                    adminId: data.notes.adminId,
                    action: "CRITICAL_TEST_REFUND_FAIL",
                    resource: `Payment ${paymentId}`,
                    details: {
                        razorpay_order_id: data.order_id,
                        error: refundErr.message,
                        source: "Webhook Fallback"
                    }
                });
            }
            return; // Exit after processing test payment
        }

        // --- 🎯 PRODUCTION PAYMENT PROCESSING (ASYNC) ---
        // Process asynchronously to return 200 immediately
        processPaymentCaptured(paymentId, payload, startTime).catch(err => {
            console.error("❌ WEBHOOK: Async processing failed:", err);
        });

        // Return immediately (prevents Razorpay retries if SMTP is slow)
        return;
    }

    // Handle order.paid event (legacy support)
    if (event === "order.paid") {
        const razorpayOrderId = payload.payload.order.entity.id;
        const paymentId = payload.payload.payment.entity.id;

        console.log(`💰 WEBHOOK: Order ${razorpayOrderId} PAID. Checking DB...`);

        const existingOrder = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpayOrderId });

        if (existingOrder) {
            console.log("✅ Order already exists and verified.");
            if (existingOrder.status === 'PENDING_PAYMENT') {
                existingOrder.status = 'PENDING_SHIPMENT';
                await existingOrder.save();
            }
        } else {
            console.warn("⚠️ ORPHANED PAYMENT: Webhook received for order not in DB.");
        }
    }
};

/**
 * Async Processing Function for payment.captured
 * Handles idempotency, order lookup, email sending, and alerting
 */
const processPaymentCaptured = async (paymentId, payload, startTime) => {
    try {
        // 1. Idempotency Check - Prevent duplicate processing
        const existingLog = await WebhookLog.findOne({
            event_type: "payment.captured",
            "payload.payment.entity.id": paymentId,
            status: { $in: ["SUCCESS", "EMAIL_FAILED"] }
        });

        if (existingLog) {
            console.log(`⏭️ WEBHOOK: Payment ${paymentId} already processed (status: ${existingLog.status})`);
            return;
        }

        // 2. Find order by Razorpay payment ID
        const order = await Order.findOne({ transactionId: paymentId });

        if (!order) {
            console.warn(`⚠️ WEBHOOK: Order not found for payment ${paymentId}`);

            // Alert admin about orphaned payment
            await alertService.sendCriticalAlert({
                type: "ORPHANED_PAYMENT",
                paymentId,
                message: `Payment ${paymentId} captured but order not found in database`
            });

            // Log orphaned payment
            await WebhookLog.create({
                event_type: "payment.captured",
                payload,
                status: "ORPHANED_PAYMENT",
                error_message: "Order not found in database",
                processing_time_ms: Date.now() - startTime
            });

            return;
        }

        console.log(`✅ WEBHOOK: Found order ${order.orderId} for payment ${paymentId}`);

        // 3. Send Admin Email (async, non-blocking)
        let emailSent = false;
        let emailError = null;

        try {
            await emailService.sendAdminOrderNotification(order);
            emailSent = true;
            console.log(`✅ WEBHOOK: Admin email sent for order ${order.orderId}`);
        } catch (error) {
            emailError = error.message;
            console.error(`❌ WEBHOOK: Email failed for order ${order.orderId}:`, emailError);

            // Alert admin about email failure
            await alertService.sendCriticalAlert({
                type: "EMAIL_SEND_FAILED",
                orderId: order.orderId,
                paymentId,
                error: emailError
            });
        }

        // 4. Log webhook processing
        await WebhookLog.create({
            event_type: "payment.captured",
            payload,
            status: emailSent ? "SUCCESS" : "EMAIL_FAILED",
            error_message: emailError,
            processing_time_ms: Date.now() - startTime
        });

        const processingTime = Date.now() - startTime;
        console.log(`✅ WEBHOOK: Processed payment ${paymentId} in ${processingTime}ms (Email: ${emailSent ? 'Sent' : 'Failed'})`);

    } catch (error) {
        console.error(`❌ WEBHOOK: Critical error processing payment ${paymentId}:`, error);

        // Log critical failure
        await WebhookLog.create({
            event_type: "payment.captured",
            payload,
            status: "PROCESSING_FAILED",
            error_message: error.message,
            processing_time_ms: Date.now() - startTime
        });

        // Alert admin
        await alertService.sendCriticalAlert({
            type: "WEBHOOK_FAILURE",
            paymentId,
            error: error.message
        });
    }
};
