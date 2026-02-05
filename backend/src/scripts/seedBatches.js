const mongoose = require('mongoose');
const Batch = require('../models/Batch');
require('dotenv').config();

const seedBatches = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");

        const variants = [
            { name: "Kasturi Special - 1KG", cost: 265 },
            { name: "Kasturi Special - 500G", cost: 140 },
            { name: "Kasturi Special - 250G", cost: 75 }
        ];

        for (const v of variants) {
            const exists = await Batch.findOne({ variantName: v.name });
            if (!exists) {
                await Batch.create({
                    batchCode: `BATCH-INIT-${v.name.replace(/\s/g, '').slice(0, 5)}`,
                    variantName: v.name,
                    mfgDate: new Date(),
                    costPerUnit: v.cost,
                    initialQuantity: 1000,
                    remainingQuantity: 1000,
                    isActive: true
                });
                console.log(`✅ Created Init Batch for ${v.name}`);
            } else {
                console.log(`⚠️ Batch already exists for ${v.name}`);
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedBatches();
