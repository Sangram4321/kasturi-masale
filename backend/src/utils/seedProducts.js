const Product = require("../models/Product");

const DEFAULT_PRODUCTS = [
    { variant: "200", name: "Kanda Lasun Masala (200g)", weight: 0.2 },
    { variant: "500", name: "Kanda Lasun Masala (500g)", weight: 0.5 },
    { variant: "1000", name: "Kanda Lasun Masala (1kg)", weight: 1.0 },
    { variant: "2000", name: "Kanda Lasun Masala (2kg)", weight: 2.0 },
    { variant: "CUSTOM", name: "Custom Mix", weight: 0.5 } // Fallback
];

const seedProducts = async () => {
    try {
        for (const p of DEFAULT_PRODUCTS) {
            // Upsert: Create if not exists, but DO NOT overwrite changes (using setOnInsert)
            // Actually user said "must NOT overwrite existing". setOnInsert is perfect.
            // But findOne and then create is safer to ensure we don't touch existing docs at all.

            const exists = await Product.findOne({ variant: p.variant });
            if (!exists) {
                await Product.create(p);
                console.log(`✅ [SEED] Created Product Variant: ${p.variant} (${p.weight}kg)`);
            }
        }
        console.log("🌱 Product Seeding Complete (Idempotent)");
    } catch (error) {
        console.error("❌ Product Seeding Failed:", error.message);
    }
};

module.exports = seedProducts;
