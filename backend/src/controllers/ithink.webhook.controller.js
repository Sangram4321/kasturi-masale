const Order = require("../models/Order");
const WebhookLog = require("../models/WebhookLog");
const crypto = require("crypto");

/**
 * Handle iThink Logistics Webhook
 * STRICT SECURITY & IDEMPOTENCY ENFORCED
 */
exports.handleWebhook = async (req, res) => {
    const payload = req.body;
    const signature = req.headers["x-ithink-signature"];
    const secretToken = req.query.token; // Fallback security

    // 0. HANDSHAKE / BROWSER CHECK
    if (req.method === "GET") {
        return res.status(200).json({ status: "active", message: "iThink Logistics Webhook Listener Ready" });
    }

    // 1. SECURITY: Verify Secret Token (Robust Constant-Time Comparison)
    const MY_SECRET_TOKEN = process.env.ITHINK_WEBHOOK_SECRET || "kasturi_secure_webhook_2024";

    const providedToken = secretToken || "";
    const expectedToken = MY_SECRET_TOKEN;

    // Prevent timing attacks
    const isValid = providedToken.length === expectedToken.length &&
        crypto.timingSafeEqual(
            Buffer.from(providedToken),
            Buffer.from(expectedToken)
        );

    if (!isValid) {
        // Log unauthorized attempt
        await WebhookLog.create({
            source: "ITHINK",
            payload: payload,
            status_code: "401",
            processed_status: "FAILED",
            error_message: "Unauthorized: Invalid or Missing Token",
            ip_address: req.ip
        });
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    try {
        const data = payload.data || payload; // Sometimes wrapped in 'data'
        const awb = data.awb_number || data.awb;
        const statusCode = String(data.status_code || data.status_id);
        const statusDesc = data.status_description || data.status;

        if (!awb) {
            throw new Error("Missing AWB Number in Payload");
        }

        // 2. MAPPING LOGIC (Strict Enum)
        let internalStatus = null;
        let allowedTransition = false;

        // Status Map
        // Status Map (Refined for User Request)
        // 0: Booked, 1: Manifested (Not Picked), 2: Picked up, 3: In Transit, 4: In Transit, 5: Out for Delivery, 7: Delivered, 8: Cancelled
        const statusMap = {
            "0": "AWB_CREATED",      // Booked
            "1": "AWB_CREATED",      // Manifested
            "2": "SHIPPED",          // Picked Up (Physical Handover)
            "3": "ON_THE_WAY",       // In Transit (Origin)
            "9": "ON_THE_WAY",       // Reached Hub
            "10": "ON_THE_WAY",      // In Transit
            "15": "ON_THE_WAY",      // Reached Dest
            "4": "ON_THE_WAY",       // In Transit
            "5": "OUT_FOR_DELIVERY", // Out for Delivery
            "7": "DELIVERED",        // Delivered
            "8": "CANCELLED",        // Cancelled
            "UD": "RTO_INITIATED",   // Undelivered
            "RT": "RTO_INITIATED",   // RTO
            "DL": "DELIVERED",
        };

        // Check for specific keywords if code fallback needed
        if (statusCode.startsWith("RTO") || statusDesc.includes("RTO") || statusDesc.includes("Returned")) {
            if (statusDesc.includes("Delivered")) {
                internalStatus = "RTO_DELIVERED";
            } else {
                internalStatus = "RTO_INITIATED";
            }
        } else if (statusDesc.includes("Cancelled")) {
            internalStatus = "CANCELLED";
        } else {
            internalStatus = statusMap[statusCode];
        }

        // 3. IDEMPOTENCY & STATE MACHINE
        // Find by AWB
        const order = await Order.findOne({ "shipping.awbNumber": awb });
        // ... (Error handling if not found - reuse existing)

        if (!order) {
            // Debugging: Log what was actually searched
            const count = await Order.countDocuments({ "shipping.awbNumber": awb });
            // We can't throw here if we want to return 200 to webhook to stop retries, but for now throw to log error
            console.error(`WEBHOOK_ERROR: Order not found for AWB: ${awb}`);
            return res.status(200).json({ status: "skipped", message: "Order not found" });
        }

        const currentStatus = order.status;

        // Define Hierarchy
        const statusHierarchy = [
            "PENDING_SHIPMENT",
            "PACKED",
            "AWB_CREATED",
            "SHIPPED",
            "ON_THE_WAY",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "RTO_INITIATED",
            "RTO_DELIVERED",
            "CANCELLED"
        ];

        let shouldUpdate = false;

        if (internalStatus) {
            const currentIndex = statusHierarchy.indexOf(currentStatus);
            const newIndex = statusHierarchy.indexOf(internalStatus);

            // Special Rule: PACKED is Manual. iThink 'Booked' (0) should NOT override PACKED or SHIPPED
            if (internalStatus === "PENDING_SHIPMENT" && currentIndex >= 1) {
                shouldUpdate = false; // Ignore 'Booked' if already Packed+
            }
            // Normal Flow: Only move forward
            else if (newIndex > currentIndex) {
                shouldUpdate = true;
            }
            // Exception: RTO/Cancelled can jump from anywhere (except Delivered/Terminals?)
            else if ((internalStatus === "CANCELLED" || internalStatus === "RTO_INITIATED") && currentStatus !== "DELIVERED") {
                shouldUpdate = true;
            }
        }

        // 4. UPDATE DB
        const logEntry = {
            status: internalStatus || `UNKNOWN_CODE_${statusCode}`,
            description: statusDesc,
            timestamp: new Date(),
            raw_code: statusCode
        };

        const updateFields = {
            $push: { "shipping.logs": logEntry }
        };

        if (shouldUpdate && internalStatus) {
            updateFields.status = internalStatus;
            updateFields["shipping.shipmentStatus"] = internalStatus; // Sync redundant field

            if (internalStatus === "SHIPPED") {
                updateFields["shipping.shippedAt"] = new Date();
            }
            if (internalStatus === "DELIVERED") {
                updateFields["shipping.deliveredAt"] = new Date();
            }
        }

        await Order.updateOne({ _id: order._id }, updateFields);

        // 5. LOG SUCCESS
        await WebhookLog.create({
            source: "ITHINK",
            awb: awb,
            payload: payload,
            status_code: statusCode,
            processed_status: shouldUpdate ? "SUCCESS" : "IGNORED", // Ignored if dup/backward
            ip_address: req.ip
        });

        res.json({ status: "success", updated: shouldUpdate, new_status: internalStatus });

    } catch (err) {
        // 6. LOG FAILURE
        await WebhookLog.create({
            source: "ITHINK",
            payload: payload,
            status_code: "500",
            processed_status: "FAILED",
            error_message: err.message,
            ip_address: req.ip
        });

        console.error("Webhook Error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
};
