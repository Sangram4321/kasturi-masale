const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
    {
        batchCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        // Allows linking to a specific Product Variant Name (e.g., "Kasturi_1KG") or ID
        variantName: {
            type: String,
            required: true,
            index: true
        },
        mfgDate: {
            type: Date,
            required: true
        },
        costPerUnit: {
            type: Number,
            required: true,
            min: 0
        },
        initialQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        remainingQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // 📝 Track Manual Adjustments (Offline Sales, Damage, etc.)
        history: [{
            action: { type: String, enum: ['CREATED', 'ORDER_DEDUCT', 'MANUAL_DEDUCT', 'MANUAL_ADD'], required: true },
            quantity: Number,
            reason: String,
            timestamp: { type: Date, default: Date.now },
            isVoided: { type: Boolean, default: false }
        }]
    },
    {
        timestamps: true,
        collection: "batches"
    }
);

// FIFO Index: Find oldest active batch for a variant
BatchSchema.index({ variantName: 1, isActive: 1, mfgDate: 1 });

module.exports = mongoose.model("Batch", BatchSchema);
