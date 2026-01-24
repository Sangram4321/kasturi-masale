const mongoose = require("mongoose");

const WebhookLogSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
            default: "ITHINK"
        },
        awb: {
            type: String,
            index: true
        },
        payload: {
            type: Object, // Store full raw JSON
            required: true
        },
        status_code: {
            type: String
        },
        processed_status: {
            type: String,
            enum: ["SUCCESS", "IGNORED", "FAILED", "DUPLICATE"],
            default: "PENDING"
        },
        error_message: {
            type: String
        },
        ip_address: {
            type: String
        }
    },
    {
        timestamps: true,
        collection: "webhook_logs"
    }
);

module.exports = mongoose.model("WebhookLog", WebhookLogSchema);
