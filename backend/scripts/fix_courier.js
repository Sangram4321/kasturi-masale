
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load Env
dotenv.config({ path: path.join(__dirname, "../.env") });

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", OrderSchema);

async function run() {
    try {
        console.log("Connecting to DB...");
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const result = await Order.updateMany(
            { "shipping.courierName": "Envia" },
            { $set: { "shipping.courierName": "iThink Logistics" } }
        );

        console.log(`Matched ${result.matchedCount} documents.`);
        console.log(`Modified ${result.modifiedCount} documents.`);

        // Also fix any null courierNames if they have awb
        const result2 = await Order.updateMany(
            { "shipping.courierName": null, "shipping.awbNumber": { $ne: null } },
            { $set: { "shipping.courierName": "iThink Logistics" } }
        );
        console.log(`Fixed Null Couriers: Modified ${result2.modifiedCount} documents.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
