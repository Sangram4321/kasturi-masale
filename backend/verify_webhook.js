const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const WebhookLog = require('./src/models/WebhookLog'); // Import Log Model
require('dotenv').config({ path: '.env' });

// CONNECT TO DB (To create dummy order)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("✅ DB Connected to 'kasturi'");
    } catch (err) {
        console.error("❌ DB Error", err);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();

    // 1. Create Dummy Order
    const testAwb = "TEST_AWB_" + Date.now();
    const orderId = "ORD-" + Date.now();

    const newOrder = await Order.create({
        orderId: orderId,
        customer: { name: "Test Webhook", phone: "9999999999", address: "Test Addr", pincode: "123456" },
        items: [{ variant: "100g", quantity: 1, price: 100 }],
        paymentMethod: "COD",
        pricing: { subtotal: 100, total: 100 },
        status: "PENDING_SHIPMENT",
        shipping: {
            awbNumber: testAwb,
            courierName: "iThink",
            shipmentStatus: "PENDING_SHIPMENT",
            logs: []
        },
        userId: "test_user_id"
    });

    console.log(`✅ Created Order: ${orderId} with AWB: ${testAwb}`);
    console.log("🔍 Created Order Object:", JSON.stringify(newOrder.toObject().shipping));

    // VERIFY PERSISTENCE
    const checkOrder = await Order.findOne({ "shipping.awbNumber": testAwb });
    if (!checkOrder) {
        console.error("❌ CRITICAL: Order NOT found in DB by AWB immediately after creation!");
        process.exit(1);
    } else {
        console.log("✅ verified: Order found in DB by AWB.");
    }

    // 2. Simulate Webhook (Status 2 = Picked -> Should become SHIPPED)
    const webhookUrl = "http://localhost:5000/api/orders/webhook/ithink?token=kasturi_secure_webhook_2024";

    const payload = {
        data: {
            awb_number: testAwb,
            status_code: "2",
            status_description: "Shipment Picked Up",
            location: "Mumbai Hub"
        }
    };

    try {
        console.log(`🚀 Sending Webhook to: ${webhookUrl}`);
        const res = await axios.post(webhookUrl, payload);
        console.log("✅ Webhook Response:", res.data);

        // 3. Verify DB Update
        const updatedOrder = await Order.findOne({ _id: newOrder._id });
        console.log("🔍 Updated Status in DB:", updatedOrder.status);

        if (updatedOrder.shipping && updatedOrder.shipping.logs) {
            console.log("🔍 Logs Count:", updatedOrder.shipping.logs.length);
        } else {
            console.log("🔍 Logs: None/Undefined");
        }

        if (updatedOrder.status === "SHIPPED") {
            console.log("🎉 TEST PASSED: Status updated to SHIPPED");
        } else {
            console.error("❌ TEST FAILED: Status mismatch");
        }

    } catch (err) {
        if (err.response) {
            console.error(`❌ Webhook Failed [${err.response.status} ${err.response.statusText}]`);
            console.error("Response Data:", JSON.stringify(err.response.data));

            // FETCH LOG FROM DB
            const failLog = await WebhookLog.findOne().sort({ createdAt: -1 });
            if (failLog) {
                console.error("🔥 DB Log Error Message:", failLog.error_message);
                console.error("🔥 DB Log Status:", failLog.processed_status);
            }
        } else {
            console.error("❌ Webhook Request Failed (No Response):", err.message);
        }
    } finally {
        // Cleanup
        await Order.deleteOne({ _id: newOrder._id });
        await mongoose.connection.close();
    }
};

runTest();
