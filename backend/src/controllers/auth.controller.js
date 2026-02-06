const Admin = require("../models/Admin");
const AuditLog = require("../models/AuditLog");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // Strict 15m session

// 🍪 Helper: Send Token in HttpOnly Cookie
const sendTokenResponse = (admin, statusCode, res, req) => {
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        httpOnly: true,
        secure: true, // Required for sameSite: "none"
        sameSite: "none"
    };

    console.log(`[AUTH] Creating admin_token for ${admin.username}. Options:`, {
        expires: cookieOptions.expires,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
    });

    res.cookie("admin_token", token, cookieOptions);

    // Log Successful Login
    AuditLog.create({
        adminId: admin._id,
        action: "LOGIN",
        resource: "Auth",
        details: { method: "2FA" },
        ip: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"]
    });

    admin.lastLogin = Date.now();
    admin.save({ validateBeforeSave: false });

    res.status(statusCode).json({
        success: true,
        token, // ✅ Expose token for Bearer fallback
        data: {
            username: admin.username,
            role: admin.role,
            isTwoFactorEnabled: admin.isTwoFactorEnabled
        }
    });
};

/* ================= AUTH CONTROLLERS ================= */

// 1. LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password, token } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please provide username and password" });
        }

        // Check Admin
        // IMPORTANT: We explicitly include +passwordHash to select it.
        const admin = await Admin.findOne({ username }).select("+passwordHash +twoFactorSecret");

        if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
            // Log Failed Attempt
            // await AuditLog.create
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 2FA Mandatory Check
        if (admin.isTwoFactorEnabled) {
            if (!token) {
                return res.status(403).json({ success: false, message: "2FA Token required", require2FA: true });
            }

            // Verify Token
            const verified = speakeasy.totp.verify({
                secret: admin.twoFactorSecret.base32,
                encoding: "base32",
                token: token
            });

            if (!verified) {
                return res.status(401).json({ success: false, message: "Invalid 2FA Token" });
            }
        }

        sendTokenResponse(admin, 200, res, req);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. LOGOUT
exports.logout = (req, res) => {
    res.cookie("admin_token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// 3. SETUP 2FA (Generate Secret)
exports.setup2FA = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);

        const secret = speakeasy.generateSecret({
            name: `Kasturi Masale (${admin.username})`
        });

        admin.twoFactorSecret = secret;
        await admin.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            res.status(200).json({
                success: true,
                secret: secret.base32,
                qrCode: data_url
            });
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Error generating 2FA" });
    }
};

// 4. VERIFY 2FA (Enable it)
exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const admin = await Admin.findById(req.admin.id).select("+twoFactorSecret");

        const verified = speakeasy.totp.verify({
            secret: admin.twoFactorSecret.base32,
            encoding: "base32",
            token: token
        });

        if (verified) {
            admin.isTwoFactorEnabled = true;
            await admin.save();

            await AuditLog.create({
                adminId: admin._id,
                action: "ENABLE_2FA",
                resource: "Auth",
                ip: req.ip
            });

            res.status(200).json({ success: true, message: "2FA Enabled Successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Token" });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: "Verification Error" });
    }
};

// 5. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const adminId = req.admin.id;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash(newPassword, salt);
        admin.isPasswordChangeRequired = false; // ✅ Requirement Met

        await admin.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

// 6. ROTATE PASSWORD (Voluntary / Self-Service)
exports.rotatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
        }

        const admin = await Admin.findById(adminId).select("+passwordHash");
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        // Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        // Prevent reusing same password (optional but good)
        if (await bcrypt.compare(newPassword, admin.passwordHash)) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as old password" });
        }

        // Update
        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash(newPassword, salt);
        // Ensure no pending requirement flags remain (just in case)
        admin.isPasswordChangeRequired = false;

        await admin.save();

        res.status(200).json({ success: true, message: "Password rotated successfully" });

    } catch (err) {
        console.error("Rotate Password Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 6. CREATE ADMIN (Gated)
exports.createAdmin = async (req, res) => {
    try {
        const allowCreate = process.env.ALLOW_ADMIN_CREATION === 'true';
        const adminCount = await Admin.countDocuments();

        if (!allowCreate && adminCount > 0) {
            return res.status(403).json({ success: false, message: "Admin creation is disabled." });
        }

        const { username, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            username,
            passwordHash,
            role: adminCount === 0 ? "SUPER_ADMIN" : "ADMIN"
        });

        res.status(201).json({ success: true, message: "Admin Created", adminId: admin._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create admin" });
    }
};
