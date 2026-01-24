const mongoose = require("mongoose");
const Admin = require("../src/models/Admin");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load Env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const debugAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🔥 Connected to DB");

        const admins = await Admin.find().select("+passwordHash");
        console.log(`Found ${admins.length} admins.`);

        for (const admin of admins) {
            console.log(`--------------------------------`);
            console.log(`User: ${admin.username}`);
            console.log(`Role: ${admin.role}`);
            console.log(`Hash: ${admin.passwordHash}`);

            // Test Password
            const testPass = "adminPassword123";
            const match = await bcrypt.compare(testPass, admin.passwordHash);
            console.log(`Password 'adminPassword123' match? ${match ? "✅ YES" : "❌ NO"}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugAdmin();
