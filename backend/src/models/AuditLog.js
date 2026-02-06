const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },
        action: {
            type: String,
            required: true // e.g., "LOGIN", "UPDATE_ORDER", "VIEW_SENSITIVE_DATA"
        },
        resource: {
            type: String,
            default: null // e.g., "Order #12345"
        },
        details: {
            type: Object,
            default: {}
        },
        ip: {
            type: String,
            default: null
        },
        userAgent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true, // createdAt will serve as the timestamp
        collection: "audit_logs"
    }
);

// Compounds index for performance (filtering by admin, action, and date)
AuditLogSchema.index({ adminId: 1, action: 1, createdAt: -1 });

// Auto-expire logs after 90 days to save space
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
