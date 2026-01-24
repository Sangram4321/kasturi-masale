const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Order = require("../models/Order");

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
            user = await User.create({
                uid,
                email,
                name,
                phone,
                photo
            });

            // Create empty wallet for new user
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
            await user.save();
        }

        return res.json({
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

/* ================= GET WALLLET ================= */
exports.getWallet = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            // Auto-recover if wallet missing
            const newWallet = await Wallet.create({ userId: user._id, balance: 0 });
            return res.json({ success: true, balance: 0, transactions: [] });
        }

        const transactions = await WalletTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.json({
            success: true,
            balance: wallet.balance,
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
