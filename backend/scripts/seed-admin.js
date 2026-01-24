const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Admin = require("../src/models/Admin");
const bcrypt = require("bcryptjs");

console.log("Looking for .env at:", path.resolve(__dirname, "../.env"));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🔥 Connected to MongoDB...");

        // Check if admin exists
        const exists = await Admin.findOne({ username: "admin" });
        if (exists) {
            console.log("⚠️  Admin 'admin' already exists. Skipping creation.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        await Admin.create({
            username: "admin",
            passwordHash: hashedPassword,
            role: "SUPER_ADMIN",
            isTwoFactorEnabled: false // Forces setup on first login
        });

        console.log("✅ Super Admin Created!");
        console.log("👉 Username: admin");
        console.log("👉 Password: admin123");
        console.log("\n⚠️  Please login immediately to set up 2FA.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seed Error:", err);
        process.exit(1);
    }
};

seedAdmin();
