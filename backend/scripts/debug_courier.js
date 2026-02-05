
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", OrderSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const couriers = await Order.distinct("shipping.courierName");
        console.log("Distinct Couriers:", couriers);

        process.exit();
    } catch (err) {
        console.error(err);
    }
}
run();
