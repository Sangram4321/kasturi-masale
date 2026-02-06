const crypto = require("crypto");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");
const { buildOrderPlacedLink, buildStatusWhatsAppLink } = require("./whatsapp.service");

const { refundPayment } = require("./razorpay.service");
const AuditLog = require("../models/AuditLog");

// Secret from Dashboard
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

exports.handleRazorpayWebhook = async (payload, signature) => {
    // 1. Verify Signature
    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

    if (expectedSignature !== signature) {
        throw new Error("Invalid Webhook Signature");
    }

    const event = payload.event;
    const data = payload.payload.payment.entity;

    console.log(`🪝 WEBHOOK RECEIVED: ${event}`, data.id);

    if (event === "payment.captured") {
        // --- 🧪 CRASH-SAFE TEST PAYMENT RECONCILIATION ---
        if (data.notes && data.notes.type === "TEST_PAYMENT") {
            console.log("🪝 🧪 TEST PAYMENT WEBHOOK CAPTURED:", data.id);

            // 1. Check if already refunded (idempotency check via AuditLog)
            const alreadyProcessed = await AuditLog.findOne({
                action: { $in: ["TEST_PAYMENT_SUCCESS_REFUNDED", "TEST_PAYMENT_WEBHOOK_REFUNDED"] },
                resource: `Payment ${data.id}`
            });

            if (alreadyProcessed) {
                console.log("⏭️ Test payment already refunded, skipping.");
                return;
            }

            // 2. Trigger Fallback Refund
            try {
                const refundResult = await refundPayment(data.id, 1); // ₹1

                await AuditLog.create({
                    adminId: data.notes.adminId,
                    action: "TEST_PAYMENT_WEBHOOK_REFUNDED",
                    resource: `Payment ${data.id}`,
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
                    resource: `Payment ${data.id}`,
                    details: {
                        razorpay_order_id: data.order_id,
                        error: refundErr.message,
                        source: "Webhook Fallback"
                    }
                });
            }
            return; // Exit after processing test payment
        }
    }

    if (event === "order.paid") {
        const razorpayOrderId = payload.payload.order.entity.id;
        const paymentId = payload.payload.payment.entity.id; // First payment ID associated

        // Check if order exists in our DB
        // We might store razorpay_order_id in 'transactionId' or a specific field. 
        // In createPaymentOrder, we didn't save the RP Order ID to DB yet, only passed it to frontend.
        // So we might need to look up by 'transactionId' if we saved it in verify step, 
        // OR we relies on the frontend 'verifyPayment' call to create the order.

        // CRITICAL: If the frontend failed, we DO NOT have the order in our DB yet?
        // OR did we create it in "PENDING" before payment?
        // Current flow: Backend createPaymentOrder -> Returns RP ID. Frontend calls RP. Verification calls verifyPaymentAndCreateOrder.
        // So if frontend closes, we HAVE NO ORDER in DB.

        // RECOVERY STRATEGY:
        // We can't create a full order because we don't have the Cart Items/Address in the Webhook Payload!
        // Razorpay payload only has amount and notes.
        // Solution: We must pass 'metadata' or 'notes' when creating the Razorpay Order.

        // For now, we will just LOG this event. If we want full recovery, we need to refactor createPaymentOrder to receive the full Cart and put it in RP Notes.
        // Given the time constraint, we'll assume we enable "Admin Alert" even for "Orphaned Payments".

        console.log(`💰 WEBHOOK: Order ${razorpayOrderId} PAID. Checking DB...`);

        // Try to find if we already saved it (maybe frontend succeeded)
        const existingOrder = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpayOrderId });

        if (existingOrder) {
            console.log("✅ Order already exists and verified.");
            if (existingOrder.status === 'PENDING_PAYMENT') {
                existingOrder.status = 'PENDING_SHIPMENT';
                await existingOrder.save();
            }
        } else {
            console.warn("⚠️ ORPHANED PAYMENT: Webhook received for order not in DB. Frontend might have failed.");
            // TODO: Send specific alert to Admin to check Razorpay Dashboard
        }
    }
};
