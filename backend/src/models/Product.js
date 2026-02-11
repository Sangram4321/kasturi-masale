const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        variant: {
            type: String,
            required: true,
            unique: true, // "200", "500", "1000", "2000"
            trim: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        weight: {
            type: Number, // in KG
            required: true,
            min: 0.1
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "products"
    }
);

module.exports = mongoose.model("Product", ProductSchema);
