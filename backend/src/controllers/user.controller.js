const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Order = require("../models/Order");

const { generateReferralCode, validateReferralCode } = require("../services/referral.service");

/* ================= SYNC USER (LOGIN/SIGNUP) ================= */
exports.syncUser = async (req, res) => {
    try {
        const { uid, email, name, phone, photo } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "UID required" });
        }

        // Find or create user
        let user = await User.findOne({ uid });

        if (!user) {
            // Generate Referral Code
            const newCode = await generateReferralCode();

            user = await User.create({
                uid,
                email,
                name,
                phone,
                photo,
                referralCode: newCode,
                coins: 0 // Initialize coins
            });

            // Create empty wallet for new user (Legacy support if needed)
            await Wallet.create({
                userId: user._id,
                balance: 0
            });
        } else {
            // Update existing user details if changed
            user.email = email || user.email;
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.photo = photo || user.photo;

            // Backfill referral code if missing (Migration)
            if (!user.referralCode) {
                user.referralCode = await generateReferralCode();
            }

            await user.save();
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("SYNC USER ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: "User sync failed"
        });
    }
};

/* ================= VALIDATE REFERRAL (Checkout) ================= */
exports.validateReferral = async (req, res) => {
    try {
        const { code, uid, cartTotal, phone, address } = req.body;

        const result = await validateReferralCode(code, uid, cartTotal, phone, address);

        if (!result.valid) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.json({
            success: true,
            discount: result.discount
        });

    } catch (error) {
        console.error("VALIDATE REFERRAL ERROR:", error);
        return res.status(500).json({ success: false, message: "Validation failed" });
    }
};

/* ================= GET WALLLET ================= */
exports.getWallet = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Return coins directly from User model (primary source)
        // We can still fetch transactions from the old Wallet system if needed
        const transactions = await WalletTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.json({
            success: true,
            balance: user.coins || 0, // Use user.coins instead of wallet.balance
            transactions
        });

    } catch (error) {
        console.error("GET WALLET ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wallet"
        });
    }
};

/* ================= GET USER ORDERS ================= */
exports.getUserOrders = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        // Fetch orders where userId matches and sort by newest first
        const orders = await Order.find({ userId: uid }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("GET USER ORDERS ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};
