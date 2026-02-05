const mongoose = require('mongoose');
const Order = require('./src/models/Order');

// HARDCODE URI (Safe for local debug script if .env fails)
// Use the ONE from the viewed .env file, or localhost default
// CORRECT URI from .env
const MONGO_URI = "mongodb+srv://sangrampatil1996_db_user:kasturi123@kasturi-cluster.nwpm7tj.mongodb.net/?appName=kasturi-cluster";

async function debugOrder() {
    try {
        await mongoose.connect(MONGO_URI, { dbName: "kasturi" });
        console.log("Connected to DB (kasturi)");

        const orderId = "KASTURI-AA462ADB";

        // 1. Find Specific Order
        const order = await Order.findOne({ orderId: orderId });
        if (order) {
            console.log("✅ FOUND ORDER:", JSON.stringify(order, null, 2));
        } else {
            console.log("❌ ORDER NOT FOUND IN DB with ID:", orderId);
        }

        // 2. Check Orders from Last 24 Hours
        const since = new Date();
        since.setHours(since.getHours() - 24);

        const recent = await Order.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 });
        console.log(`\nFound ${recent.length} orders in last 24h:`);

        recent.forEach(o => {
            console.log(`- [${o.status}] ${o.orderId} (User: ${o.userId || 'Guest'}) | Total: ${o.pricing?.total}`);
            if (o.orderId.includes("AA462ADB")) {
                console.log("  >>> MATCH FOUND! Details:", JSON.stringify(o, null, 2));
            }
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugOrder();
