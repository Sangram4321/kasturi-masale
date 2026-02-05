const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Order = require("../models/Order");
const { generateReferralCode, validateReferralCode } = require("../services/referral.service");
const jwt = require("jsonwebtoken");

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

        // GENERATE TOKEN (For Secure API Access)
        const token = jwt.sign({ id: user._id, uid: user.uid }, process.env.JWT_SECRET || "default_secret_key_change_me", {
            expiresIn: "30d"
        });

        return res.status(200).json({
            success: true,
            user,
            token // Return token for frontend use
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

/* ================= GET MY WALLET (SECURE) ================= */
exports.getMyWallet = async (req, res) => {
    try {
        const user = req.user; // From protectUser middleware

        // 1. Calculate Balances via Aggregation
        const stats = await WalletTransaction.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: "$status",
                    total: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", { $multiply: ["$amount", -1] }]
                        }
                    }
                }
            }
        ]);

        let activeBalance = 0;
        let pendingBalance = 0;

        stats.forEach(s => {
            if (s._id === "COMPLETED") activeBalance += s.total;
            if (s._id === "PENDING") pendingBalance += s.total;
        });

        // 2. Fetch History (Append Only / Ledger)
        const history = await WalletTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // 3. Tier Logic (Bronze: 0-99, Silver: 100-299, Gold: 300+)
        let tier = "Bronze";
        let nextTier = "Silver";
        let progress = 0;
        let coinsToNext = 0;

        if (activeBalance >= 300) {
            tier = "Gold";
            nextTier = "Max";
            progress = 100;
            coinsToNext = 0;
        } else if (activeBalance >= 100) {
            tier = "Silver";
            nextTier = "Gold";
            // 100 to 300 range (size 200). Progress = (current - 100) / 200 * 100
            progress = Math.min(100, Math.floor(((activeBalance - 100) / 200) * 100));
            coinsToNext = 300 - activeBalance;
        } else {
            tier = "Bronze";
            nextTier = "Silver";
            // 0 to 100 range.
            progress = Math.min(100, Math.floor((activeBalance / 100) * 100));
            coinsToNext = 100 - activeBalance;
        }

        return res.json({
            success: true,
            balance: activeBalance, // Main display
            pendingBalance: pendingBalance,
            tier,
            nextTier,
            progress,
            coinsToNext,
            history
        });

    } catch (error) {
        console.error("GET MY WALLET ERROR 👉", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wallet"
        });
    }
};

/* ================= GET WALLLET (Legacy / Public) ================= */
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
