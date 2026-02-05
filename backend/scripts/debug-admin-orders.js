const mongoose = require("mongoose");
const path = require("path");
const Order = require("../src/models/Order");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const debugOrders = async () => {
    try {
        console.log("🔌 Connecting to DB:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("✅ Connected.");

        // 1. Count All Orders
        const count = await Order.countDocuments({});
        console.log(`\n📊 Total Orders in DB: ${count}`);

        // 2. Fetch Recent 5 Orders (API Logic)
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
        console.log(`\n🛒 Recent 5 Orders:`);
        orders.forEach(o => {
            console.log(`- [${o.status}] ID: ${o.orderId} | Pay: ${o.paymentMethod} | Amt: ${o.pricing?.total}`);
        });

        // 3. Check for Anomalies (Missing Data)
        const invalidOrders = await Order.find({
            $or: [{ orderId: { $exists: false } }, { status: { $exists: false } }]
        });
        if (invalidOrders.length > 0) {
            console.log(`\n⚠️ Found ${invalidOrders.length} INVALID orders (missing keys)!`);
        } else {
            console.log("\n✅ No invalid order schemas found.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

debugOrders();
