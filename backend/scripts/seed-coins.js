const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");
const WalletTransaction = require("../src/models/WalletTransaction");

const seedParams = {
    uid: "test_user_123",
    coins: 100
};

const seed = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Find or Create User
        let user = await User.findOne({ uid: seedParams.uid });
        if (!user) {
            console.log("Creating new test user...");
            user = await User.create({
                uid: seedParams.uid,
                name: "Test User",
                phone: "9999999999",
                email: "test@kasturimasale.in"
            });
        }
        console.log(`User ID: ${user._id}`);

        // 2. Find or Create Wallet
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            console.log("Creating new wallet...");
            wallet = await Wallet.create({
                userId: user._id,
                balance: 0
            });
        }

        // 3. Add Coins
        wallet.balance += seedParams.coins;
        await wallet.save();
        console.log(`✅ Added ${seedParams.coins} coins. New Balance: ${wallet.balance}`);

        // 4. Add Transaction Record
        await WalletTransaction.create({
            userId: user._id,
            amount: seedParams.coins,
            type: "CREDIT",
            description: "Welcome Bonus (Test)",
            orderId: "BONUS_" + Date.now()
        });
        console.log("✅ Transaction recorded");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error Message:", err.message);
        if (err.errors) console.error("❌ Validation Errors:", JSON.stringify(err.errors, null, 2));
        process.exit(1);
    }
};

seed();
