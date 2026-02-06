const mongoose = require("mongoose");

const TestPaymentCounterSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },
        date: {
            type: String, // YYYY-MM-DD
            required: true
        },
        count: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        collection: "test_payment_counters"
    }
);

// Ensure atomic unique constraint for per-admin per-day counting
TestPaymentCounterSchema.index({ adminId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TestPaymentCounter", TestPaymentCounterSchema);
