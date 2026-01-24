const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");
const WalletTransaction = require("../src/models/WalletTransaction");
const Order = require("../src/models/Order");

const creditCoins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // 1. Find User (We'll take the most recent one created)
        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            console.log("❌ No user found. Please login on the frontend first.");
            process.exit(1);
        }

        console.log(`👤 Found User: ${user.name} (${user.uid})`);

        // 2. Create a Mock "Delivered" Order
        const order = await Order.create({
            orderId: `ORD_${Date.now()}_MANUAL`,
            customer: { name: user.name, phone: user.phone, address: "Manual Credit", pincode: "000000" },
            items: [{ variant: "200", quantity: 1, price: 120 }],
            paymentMethod: "UPI",
            pricing: { subtotal: 120, total: 120 },
            userId: user.uid,
            status: "DELIVERED", // This ensures logic would work if triggered, but we do it manually too
            shipping: { deliveredAt: new Date() }
        });

        console.log(`📦 Created Manual Order: ${order.orderId}`);

        // 3. Credit Coins
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            wallet = await Wallet.create({ userId: user._id, balance: 0 });
        }

        const coins = 6; // 5% of 120
        wallet.balance += coins;
        await wallet.save();

        await WalletTransaction.create({
            userId: user._id,
            orderId: order.orderId,
            type: "CREDIT",
            amount: coins,
            description: `Earned from Order #${order.orderId} (Manual Fix)`
        });

        console.log(`✅ Credited ${coins} Coins! New Balance: ${wallet.balance}`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        process.exit();
    }
};

creditCoins();
