const mongoose = require("mongoose");
const path = require("path");
const Order = require("../src/models/Order");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const debugAllOrders = async () => {
    try {
        console.log("🔌 Connecting to DB:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("✅ Connected.");

        // 1. Fetch ALL Orders Count
        const totalCount = await Order.countDocuments({});
        console.log(`\n📊 Total Orders in DB: ${totalCount}`);

        // 2. Fetch Recent 10 Orders (Raw)
        console.log("\n🛒 Fetching Recent 10 Orders (createdAt: -1)...");
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10).lean();

        if (orders.length === 0) {
            console.log("⚠️ No orders found!");
        } else {
            orders.forEach((o, i) => {
                console.log(`\n[${i + 1}] ID: ${o.orderId} | Status: ${o.status} | Pay: ${o.paymentMethod}`);
                console.log(`    Created: ${o.createdAt}`);
                console.log(`    Customer: ${o.customer?.name} (${o.customer?.phone})`);
                console.log(`    Items: ${o.items?.length}`);
                // Check for missing fields that might break frontend
                if (!o.orderId) console.error("    ❌ MISSING ORDER ID");
                if (!o.status) console.error("    ❌ MISSING STATUS");
                if (!o.customer) console.error("    ❌ MISSING CUSTOMER");
            });
        }

        // 3. Check for special filters (e.g. paymentStatus)
        // There is NO paymentStatus field in the schema I saw earlier, but let's check if it exists in raw data
        const paymentStatusCheck = await Order.findOne({ paymentStatus: { $exists: true } });
        if (paymentStatusCheck) {
            console.log("\n⚠️ WARN: Found 'paymentStatus' field in DB documents. Is API filtering on this?");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

debugAllOrders();
