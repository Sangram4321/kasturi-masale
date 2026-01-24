const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const Wallet = require("../src/models/Wallet");

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        const users = await User.find().lean();
        console.log(`\n📋 Found ${users.length} Users:\n`);

        for (const user of users) {
            const wallet = await Wallet.findOne({ userId: user._id }).lean();
            console.log(`👤 Name: ${user.name}`);
            console.log(`   UID: ${user.uid}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   💰 Balance: ${wallet ? wallet.balance : "No Wallet"}`);
            console.log("-----------------------------------");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        process.exit();
    }
};

listUsers();
