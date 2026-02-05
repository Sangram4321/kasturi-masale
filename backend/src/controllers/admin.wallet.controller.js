const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

/* ================= SEARCH USERS ================= */
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 3) {
            return res.status(400).json({ success: false, message: "Query must be at least 3 chars" });
        }

        const regex = new RegExp(query, "i");

        const users = await User.find({
            $or: [
                { name: regex },
                { email: regex },
                { phone: regex },
                { uid: query } // Exact match for UID
            ]
        }).select("name email phone uid coins photo createdAt");

        res.json({ success: true, users });

    } catch (error) {
        console.error("SEARCH USERS ERROR:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};

/* ================= GET USER WALLET DETAILS ================= */
exports.getUserWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

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

        // 2. Fetch History
        const history = await WalletTransaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(100) // Show more for admin
            .populate("adminId", "username"); // Show which admin made changes

        // 3. Calculate Tier (Same logic as user controller)
        let tier = "Bronze";
        if (activeBalance >= 300) tier = "Gold";
        else if (activeBalance >= 100) tier = "Silver";

        res.json({
            success: true,
            user,
            wallet: {
                balance: activeBalance,
                pendingBalance,
                tier,
                history
            }
        });

    } catch (error) {
        console.error("GET USER WALLET ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch details" });
    }
};

/* ================= ADJUST COIN BALANCE (Credit/Debit) ================= */
exports.adjustWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, type, amount, reason, description, adminNote } = req.body;
        const adminId = req.admin.id;

        if (!userId || !type || !amount || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be positive" });
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create Transaction
        const txn = await WalletTransaction.create([{
            userId: user._id,
            type: type, // CREDIT or DEBIT
            amount: amount,
            description: description || `Admin ${type === "CREDIT" ? "Adjustment" : "Deduction"}`,
            status: "COMPLETED",
            adminId: adminId,
            adjustmentReason: reason,
            adminNote: adminNote
        }], { session });

        // Audit Log
        await AuditLog.create([{
            adminId: adminId,
            action: "COIN_ADJUSTMENT",
            resource: `User: ${user.email}`,
            details: {
                userId,
                type,
                amount,
                reason,
                txnId: txn[0]._id
            },
            ip: req.ip
        }], { session });

        // Update User Cache (Optional but good for sync)
        // Note: getUserWallet calculates from txn, so this is just for redundant safety
        // user.coins = calculated... (Skipping to keep aggregation source of truth)

        await session.commitTransaction();
        res.json({ success: true, message: "Wallet adjusted successfully" });

    } catch (error) {
        await session.abortTransaction();
        console.error("ADJUST WALLET ERROR:", error);
        res.status(500).json({ success: false, message: "Adjustment failed" });
    } finally {
        session.endSession();
    }
};

/* ================= RESOLVE PENDING TRANSACTION ================= */
exports.resolvePending = async (req, res) => {
    try {
        const { transactionId, action, note } = req.body; // action: "COMPLETED" or "VOID"
        const adminId = req.admin.id;

        if (!["COMPLETED", "VOID"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const txn = await WalletTransaction.findById(transactionId);
        if (!txn) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        if (txn.status !== "PENDING") {
            return res.status(400).json({ success: false, message: `Transaction is ${txn.status}, cannot modify` });
        }

        // Update
        txn.status = action;
        txn.adminId = adminId;
        txn.adminNote = note ? `Resolution Note: ${note}` : "Manual Resolution";
        txn.adjustmentReason = "CUSTOMER_SUPPORT"; // Default reasoning
        await txn.save();

        // Audit
        await AuditLog.create({
            adminId: adminId,
            action: "RESOLVE_PENDING_TXN",
            resource: `Txn: ${txn._id}`,
            details: {
                transactionId,
                action,
                amount: txn.amount,
                userId: txn.userId
            },
            ip: req.ip
        });

        res.json({ success: true, message: `Transaction marked as ${action}` });

    } catch (error) {
        console.error("RESOLVE PENDING ERROR:", error);
        res.status(500).json({ success: false, message: "Resolution failed" });
    }
};
