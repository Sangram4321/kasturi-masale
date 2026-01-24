require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const Order = require("../src/models/Order");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log("--- LATEST 5 ORDERS ---");
        orders.forEach(o => {
            console.log(`ID: ${o.orderId} | Status: ${o.status} | Pay: ${o.paymentMethod} | Date: ${o.createdAt}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
