require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./src/models/Order");

async function debugAdminView() {
    try {
        console.log("🔥 CONNECTING TO DB...");
        // Use explicit DB name as per server config
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("✅ CONNECTED.");

        console.log("🔍 QUERYING ALL ORDERS (Simulating getAllOrders)...");
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

        console.log(`📊 TOTAL ORDERS FOUND: ${orders.length}`);

        if (orders.length > 0) {
            console.log("\n--- LATEST ORDER ---");
            const o = orders[0]; // Sorted by createdAt -1
            console.log(`ID: ${o.orderId}`);
            console.log(`User: ${o.userId || 'NULL'}`);
            console.log(`Status: ${o.status}`);
            console.log(`Total: ${o.pricing?.total}`);
            console.log(`Created: ${o.createdAt}`);
        } else {
            console.log("❌ NO ORDERS FOUND.");
        }

        process.exit(0);
    } catch (e) {
        console.error("DEBUG ERROR:", e);
        process.exit(1);
    }
}

debugAdminView();
