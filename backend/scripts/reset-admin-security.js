const mongoose = require("mongoose");
const Admin = require("../src/models/Admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const resetAdminSecurity = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🔥 Connected to DB");

        const admin = await Admin.findOne({ username: "admin" });

        if (!admin) {
            console.log("❌ Admin user not found!");
            process.exit(1);
        }

        console.log("Found Admin:", admin.username);

        // RESET SECURITY FLAGS
        admin.isTwoFactorEnabled = false;
        admin.twoFactorSecret = undefined;
        admin.isPasswordChangeRequired = true; // Enforce password change

        await admin.save();

        console.log("✅ 2FA Reset Successfully.");
        console.log("✅ Password Change Enforced on next login.");

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

resetAdminSecurity();
