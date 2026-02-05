const mongoose = require("mongoose");
const path = require("path");
const Order = require("../src/models/Order");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const debugAdminView = async () => {
    try {
        console.log("🔌 Connecting to DB:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });

        // 1. Simulate getAllOrders (Safe Version)
        console.log("\n🧪 1. Testing Order.find({}) (Safe View)...");
        const allOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).lean();
        console.log(`   Found ${allOrders.length} orders.`);
        allOrders.forEach(o => {
            console.log(`   - [${o.orderId}] Status: "${o.status}" | Created: ${o.createdAt} | Payment: ${o.paymentMethod}`);
        });

        // 2. Simulate Dashboard Stats (Active Count)
        const activeStatuses = ["PENDING_SHIPMENT", "PACKED", "SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"];
        console.log(`\n🧪 2. Testing Active Count (Statuses: ${activeStatuses.join(", ")})...`);
        const activeCount = await Order.countDocuments({ status: { $in: activeStatuses } });
        console.log(`   Active Count: ${activeCount}`);

        // 3. Simulate Dashboard Recent Orders
        console.log("\n🧪 3. Testing Recent Orders Query...");
        const recent = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("orderId customer.name pricing.total status createdAt")
            .lean();

        console.log(`   Found ${recent.length} recent orders.`);
        recent.forEach(o => {
            console.log(`   - [${o.orderId}] ${o.customer?.name} - ${o.status}`);
        });

        // 4. Check for 'paymentStatus' or other hidden fields
        console.log("\n🧪 4. Checking for hidden fields on latest order...");
        const latest = await Order.findOne({}).sort({ createdAt: -1 }).lean();
        if (latest) {
            console.log("   Latest Raw:", JSON.stringify(latest, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

debugAdminView();
