const mongoose = require("mongoose");
const Admin = require("../src/models/Admin");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load Env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "kasturi" });
        console.log("🔥 Connected to DB (kasturi)");

        const username = "admin";
        const password = "adminPassword123"; // CHANGE THIS IN PRODUCTION

        // Check if exists
        const exists = await Admin.findOne({ username });
        if (exists) {
            console.log("⚠️ Admin already exists");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await Admin.create({
            username,
            passwordHash,
            role: "SUPER_ADMIN"
        });

        console.log(`✅ Super Admin created!`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
        console.log("⚠️ PLEASE CHANGE PASSWORD & ENABLE 2FA IMMEDIATELY!");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
