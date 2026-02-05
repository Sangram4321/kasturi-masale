const Batch = require('../models/Batch');
const Order = require('../models/Order');

// 🏭 ASSIGN BATCH (FIFO Logic)
// Triggered when Order Status -> PACKED
exports.assignBatchesToOrder = async (orderId) => {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");

    let totalProductCost = 0;
    const updatedItems = [];

    for (const item of order.items) {
        // Skip if already assigned
        if (item.batchId) {
            updatedItems.push(item);
            totalProductCost += (item.costAtTimeOfOrder * item.quantity);
            continue;
        }

        // Find oldest active batch for this variant
        // Note: In real app, might need to handle split across batches. 
        // Here we simplify: Assign to oldest available, decrement, if not enough, go negative or fail? 
        // Allowing negative for now to prevent blocking flow, but logging warning.
        let batch = await Batch.findOne({
            variantName: item.variant,
            isActive: true
        }).sort({ mfgDate: 1 });

        // 🔍 FALLBACK: Fuzzy Search (e.g. item="500" matches "Kasturi_500G")
        if (!batch) {
            batch = await Batch.findOne({
                variantName: { $regex: item.variant, $options: 'i' },
                isActive: true
            }).sort({ mfgDate: 1 });
        }

        if (batch) {
            // Deduct Stock
            batch.remainingQuantity -= item.quantity;

            // 📝 Ledger Entry
            batch.history.push({
                action: 'ORDER_DEDUCT',
                quantity: item.quantity,
                reason: `Order ${orderId}`,
                timestamp: new Date()
            });

            if (batch.remainingQuantity <= 0) {
                batch.isActive = false; // Mark finished if 0 or less
            }
            await batch.save();

            // Update Item
            const cost = batch.costPerUnit;
            updatedItems.push({
                ...item.toObject(),
                batchId: batch._id,
                costAtTimeOfOrder: cost
            });
            totalProductCost += (cost * item.quantity);
        } else {
            console.warn(`⚠️ No active batch found for ${item.variant}. Costing set to 0.`);
            updatedItems.push({ ...item.toObject(), costAtTimeOfOrder: 0 });
        }
    }

    // Save updates
    order.items = updatedItems;
    // Temporary save to financials, will finalize on DELIVERED
    order.financials.totalProductCost = totalProductCost;
    await order.save();
    return totalProductCost;
};


// 💰 CALCULATE FINAL PROFIT
// Triggered when Order Status -> DELIVERED
exports.calculateOrderProfit = async (orderId) => {
    const order = await Order.findOne({ orderId });
    if (!order) return;

    // 1. REVENUE
    const grossRevenue = order.pricing.total; // Total paid by user

    // 2. GST LIABILITY (Assuming 5% or 12% on Food Products? User said "Product-wise GST", using standard 5% for Spices for now or back-calculating)
    // Formula: Taxable Value = Gross / (1 + GST_RATE)
    // GST Amount = Gross - Taxable
    // Let's assume global 5% for spices if not defined per product. Phase 1 simplification.
    const GST_RATE = 0.05;
    const taxableValue = grossRevenue / (1 + GST_RATE);
    const gstAmount = grossRevenue - taxableValue;

    // 3. COSTS
    // A. Product Cost (already snapshotted in assignBatches)
    const productCost = order.financials.totalProductCost || 0;

    // B. Shipping (Phase 1: Flat Rate Estimate if actual Log missing)
    // If we have actual log from Envia (shipping.cost), use it. Else estimate ₹60/kg
    const shippingCost = order.shipping?.cost || 60;

    // C. Packaging
    const packagingCost = 15; // Flat ₹15 per box estimate

    // D. Gateway Fee (Razorpay ~2%)
    const platformFee = order.paymentMethod === 'UPI' ? (grossRevenue * 0.02) : 0;

    const totalCosts = productCost + shippingCost + packagingCost + platformFee;

    // 4. NET PROFIT
    // Profit = Taxable Revenue - Total Costs (User requested: Profit should be calculated on revenue excluding GST)
    const netProfit = taxableValue - totalCosts;
    const margin = (netProfit / taxableValue) * 100;

    // 5. SAVE
    order.financials = {
        grossRevenue,
        taxableValue,
        gstAmount,
        totalProductCost: productCost,
        shippingCost,
        packagingCost,
        platformFee,
        netProfit,
        profitMargin: margin
    };

    await order.save();
    console.log(`💰 Financials Locked for ${orderId}: Profit ₹${netProfit.toFixed(2)} (${margin.toFixed(1)}%)`);
};
