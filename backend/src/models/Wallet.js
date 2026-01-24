const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        balance: {
            type: Number,
            default: 0,
            min: 0 // Prevent negative balance
        }
    },
    {
        timestamps: true,
        collection: "wallets"
    }
);

module.exports = mongoose.model("Wallet", WalletSchema);
