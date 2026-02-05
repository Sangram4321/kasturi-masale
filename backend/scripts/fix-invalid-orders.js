const mongoose = require("mongoose");
const path = require("path");
const Order = require("../src/models/Order");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const fixOrders = async () => {
    try {
        console.log("🔌 Connecting to DB:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("✅ Connected.");

        // Find Invalid
        const invalidOrders = await Order.find({
            $or: [{ orderId: { $exists: false } }, { status: { $exists: false } }]
        });

        console.log(`\n⚠️ Found ${invalidOrders.length} INVALID orders.`);

        if (invalidOrders.length > 0) {
            // Delete them
            const res = await Order.deleteMany({
                $or: [{ orderId: { $exists: false } }, { status: { $exists: false } }]
            });
            console.log(`🗑️ Deleted ${res.deletedCount} corrupted records.`);
        } else {
            console.log("✅ No cleanup needed.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

fixOrders();
