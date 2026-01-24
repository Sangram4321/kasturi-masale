require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');

const Order = require('./src/models/Order');
const { createShipment } = require('./src/controllers/order.controller');


const trigger = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const order = await Order.findOne({ status: "PENDING_SHIPMENT" }).sort({ createdAt: -1 });
        if (!order) {
            console.log("No pending orders found to test.");
            const anyOrder = await Order.findOne().sort({ createdAt: -1 });
            if (anyOrder) {
                console.log("Using latest order:", anyOrder.orderId);
                // Mock req, res
                const req = { params: { orderId: anyOrder.orderId } };
                const res = {
                    status: (code) => ({ json: (data) => console.log("STATUS:", code, data) }),
                    json: (data) => {
                        console.log("JSON:", JSON.stringify(data, null, 2));
                        fs.writeFileSync('envia_response.json', JSON.stringify(data, null, 2));
                    }
                };
                await createShipment(req, res);
            }
        } else {
            console.log("Testing with Order:", order.orderId);
            const req = { params: { orderId: order.orderId } };
            const res = {
                status: (code) => ({ json: (data) => console.log("STATUS:", code, data) }),
                json: (data) => {
                    console.log("JSON:", JSON.stringify(data, null, 2));
                    fs.writeFileSync('envia_response.json', JSON.stringify(data, null, 2));
                }
            };
            await createShipment(req, res);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

trigger();
