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
        }
    },
    {
        timestamps: true,
        collection: "wallet_transactions"
    }
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
