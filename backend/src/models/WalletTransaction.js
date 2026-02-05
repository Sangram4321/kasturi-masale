const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderId: {
            type: String, // String to match Order model's orderId
            default: null,
            index: true
        },
        type: {
            type: String,
            enum: ["CREDIT", "DEBIT"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        expiryDate: {
            type: Date,
            default: null
        },
        isExpired: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["COMPLETED", "PENDING", "FAILED", "VOID"],
            default: "COMPLETED",
            index: true
        },
        // Admin Audit Fields
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        },
        adjustmentReason: {
            type: String,
            enum: ["MANUAL_REWARD", "CUSTOMER_SUPPORT", "ORDER_CORRECTION", "REFUND_ADJUSTMENT", "PROMOTIONAL_GRANT", null],
            default: null
        },
        adminNote: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "wallet_transactions"
    }
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
