const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protectAdmin = async (req, res, next) => {
    try {
        // 1. Get Token from Cookie
        // 1. Get Token from Cookie OR Header
        let token;
        if (req.cookies.admin_token) {
            token = req.cookies.admin_token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            console.log("❌ Auth Failed: No Token Found");
            console.log("Cookies:", req.cookies);
            console.log("Auth Header:", req.headers.authorization);
            console.log("Origin:", req.headers.origin);
            return res.status(401).json({ success: false, message: "Not authorized loading access to this route" });
        }

        // 2. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key_change_me");

        // 3. Check if Admin still exists
        const admin = await Admin.findById(decoded.id).select("-passwordHash -twoFactorSecret");
        if (!admin) {
            return res.status(401).json({ success: false, message: "User belonging to this token no longer exists" });
        }

        // 4. Grant Access
        req.admin = admin;
        next();

    } catch (error) {
        // Handle JWT Errors specifically
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired, please login again" });
        }
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
        }
        next();
    };
};

module.exports = {
    protectAdmin,
    restrictTo
};
