const mongoose = require("mongoose");
const Batch = require("../src/models/Batch");
require("dotenv").config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("DB Connected"))
    .catch(err => console.error(err));

const fixBatchHistory = async () => {
    try {
        const batches = await Batch.find({});
        console.log(`Checking ${batches.length} batches...`);

        for (const batch of batches) {
            let hasCreated = batch.history.find(h => h.action === 'CREATED');

            if (!hasCreated) {
                console.log(`Backfilling CREATED for ${batch.batchCode}`);

                // Unshift to beginning of history
                batch.history.unshift({
                    action: 'CREATED',
                    quantity: batch.initialQuantity,
                    reason: 'Initial Stock Entry (Backfilled)',
                    timestamp: batch.createdAt || batch.mfgDate || new Date()
                });

                await batch.save();
            }
        }

        console.log("Batch History Fix Complete.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

fixBatchHistory();
