const mongoose = require("mongoose");
const Batch = require("../src/models/Batch");
require("dotenv").config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("DB Connected"))
    .catch(err => console.error(err));

const seedStockHistory = async () => {
    try {
        const batches = await Batch.find({ isActive: true });
        if (batches.length === 0) {
            console.log("No active batches to seed.");
            return;
        }

        const batch = batches[0]; // Pick first batch
        console.log(`Seeding history for batch: ${batch.batchCode}`);

        // Generate dates for last 14 days
        const actions = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Random Stock IN (Restock)
            if (Math.random() > 0.8) {
                actions.push({
                    action: 'MANUAL_ADD',
                    quantity: Math.floor(Math.random() * 50) + 10,
                    reason: 'Restock / Return',
                    timestamp: date
                });
            }

            // Random Stock OUT (Orders)
            if (Math.random() > 0.3) {
                actions.push({
                    action: 'ORDER_DEDUCT',
                    quantity: Math.floor(Math.random() * 20) + 5,
                    reason: 'Online Order',
                    timestamp: date
                });
            }
        }

        // Add to history
        batch.history.push(...actions);

        // Update remaining quantity roughly (not exact, just for chart viz)
        // (In real app, we update strictly, but here we just want history entries)

        await batch.save();
        console.log("Stock History Seeded! Check Dashboard.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedStockHistory();
