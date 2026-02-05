const Batch = require("../models/Batch");

/* ================= CREATE BATCH ================= */
exports.createBatch = async (req, res) => {
    try {
        const { variantName, mfgDate, costPerUnit, initialQuantity } = req.body;

        if (!variantName || !costPerUnit || !initialQuantity) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Generate Code: BATCH-VAR-DATE-RANDOM
        const dateStr = new Date(mfgDate).toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(1000 + Math.random() * 9000);
        const batchCode = `BATCH-${variantName.slice(0, 4).toUpperCase()}-${dateStr}-${random}`;

        const now = new Date(); // ✅ ADDED

        const newBatch = await Batch.create({
            batchCode,
            variantName,
            mfgDate,
            costPerUnit,
            initialQuantity,
            remainingQuantity: initialQuantity,
            isActive: true,
            history: [{
                action: 'CREATED',
                quantity: initialQuantity,
                reason: 'Initial Stock Entry',
                timestamp: now // ✅ ADDED
            }]
        });

        res.status(201).json({ success: true, batch: newBatch });

    } catch (error) {
        console.error("CREATE BATCH ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to create batch" });
    }
};

/* ================= GET ALL BATCHES (WITH LEDGER STATS) ================= */
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find().sort({ isActive: -1, mfgDate: -1 }).lean();

        const enhancedBatches = batches.map(b => {
            const online = (b.history || [])
                .filter(h => h.action === 'ORDER_DEDUCT')
                .reduce((sum, h) => sum + (h.quantity || 0), 0);

            const offline = (b.history || [])
                .filter(h => h.action === 'MANUAL_DEDUCT')
                .reduce((sum, h) => sum + (h.quantity || 0), 0);

            return {
                ...b,
                stats: {
                    produced: b.initialQuantity,
                    onlineSold: online,
                    offlineSold: offline,
                    remaining: b.remainingQuantity
                }
            };
        });

        res.json({ success: true, batches: enhancedBatches });
    } catch (error) {
        console.error("BATCH FETCH ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch batches" });
    }
};

/* ================= INVENTORY STATS AGGREGATION ================= */
exports.getInventoryStats = async (req, res) => {
    try {
        const stats = await Batch.aggregate([
            { $unwind: "$history" },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: { $ifNull: ["$history.timestamp", "$createdAt"] } // ✅ SAFE FIX
                            }
                        },
                        action: "$history.action"
                    },
                    totalQty: { $sum: "$history.quantity" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        const trend = {};
        stats.forEach(s => {
            const date = s._id.date;
            if (!trend[date]) {
                trend[date] = {
                    date,
                    stockIn: 0,
                    stockOut_Online: 0,
                    stockOut_Offline: 0
                };
            }

            if (s._id.action === 'CREATED' || s._id.action === 'MANUAL_ADD') {
                trend[date].stockIn += s.totalQty;
            } else if (s._id.action === 'ORDER_DEDUCT') {
                trend[date].stockOut_Online += s.totalQty;
            } else if (s._id.action === 'MANUAL_DEDUCT') {
                trend[date].stockOut_Offline += s.totalQty;
            }
        });

        const chartData = Object.values(trend).slice(-30);

        const today = new Date().toISOString().slice(0, 10);
        const currentMonth = today.slice(0, 7);

        let todayStats = { in: 0, out: 0, net: 0 };
        let monthStats = { in: 0, out: 0, net: 0 };

        stats.forEach(s => {
            const qty = s.totalQty;
            const isIn = (s._id.action === 'CREATED' || s._id.action === 'MANUAL_ADD');
            const date = s._id.date;

            if (date === today) {
                if (isIn) todayStats.in += qty;
                else todayStats.out += qty;
            }

            if (date.startsWith(currentMonth)) {
                if (isIn) monthStats.in += qty;
                else monthStats.out += qty;
            }
        });

        todayStats.net = todayStats.in - todayStats.out;
        monthStats.net = monthStats.in - monthStats.out;

        res.json({ success: true, chartData, todayStats, monthStats });

    } catch (error) {
        console.error("INV STATS ERROR:", error);
        res.status(500).json({ success: false, message: "Stats fetch failed" });
    }
};

/* ================= MANUAL STOCK OUT (OFFLINE SALE) ================= */
exports.manualStockOut = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { quantity: rawQty, reason } = req.body;
        const quantity = parseInt(rawQty);

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

        if (batch.remainingQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Remaining: ${batch.remainingQuantity}`
            });
        }

        batch.remainingQuantity -= quantity;

        batch.history.push({
            action: 'MANUAL_DEDUCT',
            quantity: quantity,
            reason: reason || 'Offline Stock Out',
            timestamp: new Date() // ✅ ADDED
        });

        if (batch.remainingQuantity === 0) {
            batch.isActive = false;
        }

        await batch.save();
        res.json({ success: true, message: "Stock deducted successfully", batch });

    } catch (error) {
        console.error("STOCK OUT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update stock" });
    }
};

/* ================= MANUAL STOCK IN (RETURN / CORRECTION) ================= */
exports.manualStockIn = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { quantity: rawQty, reason } = req.body;
        const quantity = parseInt(rawQty);

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

        batch.remainingQuantity += quantity;

        if (batch.remainingQuantity > 0) {
            batch.isActive = true;
        }

        batch.history.push({
            action: 'MANUAL_ADD',
            quantity: quantity,
            reason: reason || 'Stock Correction / Return',
            timestamp: new Date() // ✅ ADDED
        });

        await batch.save();
        res.json({ success: true, message: "Stock added successfully", batch });

    } catch (error) {
        console.error("STOCK IN ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update stock" });
    }
};

/* ================= UPDATE BATCH (Correction) ================= */
exports.updateBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const updates = req.body;

        const batch = await Batch.findByIdAndUpdate(batchId, updates, { new: true });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
};
/* ================= DELETE BATCH ================= */
exports.deleteBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        await Batch.findByIdAndDelete(batchId);
        res.json({ success: true, message: "Batch deleted successfully" });
    } catch (error) {
        console.error("DELETE BATCH ERROR:", error);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

/* ================= VOID HISTORY ENTRY (Soft Delete) ================= */
exports.voidHistoryEntry = async (req, res) => {
    try {
        const { batchId, entryId } = req.params;
        const batch = await Batch.findById(batchId);

        if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

        const entry = batch.history.id(entryId);
        if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

        if (entry.isVoided) {
            return res.status(400).json({ success: false, message: "Entry is already voided" });
        }

        // 🔄 Reverse Stock Impact
        if (entry.action === 'MANUAL_ADD' || entry.action === 'CREATED') {
            batch.remainingQuantity -= entry.quantity;
        } else if (entry.action === 'MANUAL_DEDUCT' || entry.action === 'ORDER_DEDUCT') {
            batch.remainingQuantity += entry.quantity;
        }

        // Mark as Voided
        entry.isVoided = true;
        entry.reason = `[VOIDED] ${entry.reason}`; // Append tag for clarity

        // Update Active Status
        batch.remainingQuantity = Math.max(0, batch.remainingQuantity);
        batch.isActive = batch.remainingQuantity > 0;

        await batch.save();

        res.json({ success: true, message: "Entry voided successfully", batch });

    } catch (error) {
        console.error("VOID ENTRY ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to void entry" });
    }
};
