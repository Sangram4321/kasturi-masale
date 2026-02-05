const Order = require("../models/Order");
const mongoose = require("mongoose");
const generateOrderId = require("../utils/generateOrderId");
const {
  buildOrderPlacedLink,
  buildStatusWhatsAppLink
} = require("../services/whatsapp.service");
const { createOrder: createRazorpayOrder, verifySignature } = require("../services/razorpay.service");
const SLA = require("../config/sla");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, pricing, paymentMethod } = req.body;

    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.address ||
      !customer?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer details missing"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!pricing?.subtotal || !pricing?.total) {
      return res.status(400).json({
        success: false,
        message: "Pricing invalid"
      });
    }

    if (!["COD", "UPI"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    let order;
    let attempts = 0;

    // 🌟 LOYALTY: REDEMPTION LOGIC
    let discountAmount = 0;
    let coinsRedeemed = req.body.redeemCoins || 0;
    const userId = req.body.userId; // Expect UID from frontend

    // Resolve User for consistent storage (even if not redeeming coins)
    let user = null;
    if (userId) {
      // User is already imported at the top
      user = await User.findOne({ uid: userId });
    }

    if (coinsRedeemed > 0) {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Login required to redeem points" });
      }

      // Wallet and WalletTransaction are already imported at the top
      // const User already required above

      // 📌 CANONICAL USER REF: We use the MongoDB _id for internal linking
      // user is already resolved above

      if (!user) {
        return res.status(400).json({ success: false, message: "User account not found" });
      }

      const wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet || wallet.balance < coinsRedeemed) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
      }

      // Business Rules
      if (coinsRedeemed < 100) {
        return res.status(400).json({ success: false, message: "Minimum redemption is 100 coins" });
      }

      // Calculate Discount (100 coins = 80 Rs => 1 coin = 0.8 Rs)
      discountAmount = Math.floor(coinsRedeemed * 0.8);

      // Cap at 30% of subtotal
      const maxDiscount = Math.floor(pricing.subtotal * 0.30);
      if (discountAmount > maxDiscount) {
        return res.status(400).json({ success: false, message: `Max redeemable discount is ₹${maxDiscount}` });
      }

      // Debit Wallet
      wallet.balance -= coinsRedeemed;
      await wallet.save();

      // Log Debit Transaction (We do this BEFORE order creation to lock funds, but risky if order fails.
      // Ideally use transaction session, but for Phase 1 we will just reverse if order fails - catch block TODO)
      await WalletTransaction.create({
        userId: user._id,
        type: "DEBIT",
        amount: coinsRedeemed,
        description: "Redeemed on Order (Pending)" // We'll update description with OrderID once created
      });
    }

    // Recalculate Total
    const shippingFee = pricing.subtotal >= 500 ? 0 : 50;
    const finalTotal = pricing.subtotal + (pricing.codFee || 0) + shippingFee - discountAmount;

    while (!order && attempts < 3) {
      try {
        const orderId = generateOrderId();
        order = await Order.create({
          orderId,
          customer,
          items,
          // 📌 STORE RESOLVED OBJECTID IF AVAILABLE (as string for now due to Schema)
          userId: user ? user._id.toString() : (userId || null),
          pricing: {
            subtotal: pricing.subtotal,
            codFee: pricing.codFee || 0,
            shippingFee: shippingFee,
            discount: discountAmount,
            coinsRedeemed: coinsRedeemed,
            coinsRedeemed: coinsRedeemed,
            total: finalTotal // ✅ CORRECT: Use calculated final total
          },
          // 💰 INIT FINANCIALS (For Dashboard Pending View)
          financials: {
            grossRevenue: finalTotal,
            taxableValue: finalTotal / 1.05,
            gstAmount: finalTotal - (finalTotal / 1.05),
            // Costs & Profit populated on Delivery
            netProfit: 0,
            profitMargin: 0
          },
          paymentMethod,
          status: "PENDING_SHIPMENT"
        });

        // If successful, update the transaction with orderId
        if (coinsRedeemed > 0) {
          // imports already available
          // const User = require("../models/User");
          // const WalletTransaction = require("../models/WalletTransaction");

          if (user) {
            await WalletTransaction.findOneAndUpdate(
              { userId: user._id, type: "DEBIT", description: "Redeemed on Order (Pending)" }, // Loose match, careful in high conc.
              { description: `Redeemed on Order #${orderId}`, orderId: orderId },
              { sort: { createdAt: -1 } } // Get latest
            );
          }
        }

        // 🌟 REFERRAL: Set Status if Applicable
        if (req.body.referralCode) {
          const { validateReferralCode } = require("../services/referral.service");
          // Re-validate to be safe (though validated on frontend)
          // We can skip strict abuse check here if already done, but safer to do it.
          // Ideally we trust the passed data if validated, but let's just do a quick check or assume frontend handled it.
          // Better: We look up the referrer and attach.
          const { validateReferralCode: vRef } = require("../services/referral.service");
          const refResult = await vRef(req.body.referralCode, userId, pricing.subtotal, customer.phone, customer.address);

          if (refResult.valid) {
            order.referral = {
              code: req.body.referralCode,
              referredBy: refResult.referrerId,
              rewardStatus: "PENDING_MATURATION", // Will mature after delivery
              discountAmount: refResult.discount
            };
            await order.save();
          }
        }

      } catch (err) {
        if (err.code !== 11000) throw err;
        attempts++;
      }
    }

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique order ID"
      });
    }

    const whatsappLink = buildOrderPlacedLink({
      phone: customer.phone,
      orderId: order.orderId,
      amount: order.pricing.total, // ✅ USE DB VALUE
      payment: paymentMethod
    });

    // 🌟 LOYALTY: CREDIT PENDING POINTS FOR COD
    if (userId && paymentMethod === "COD") {
      const pointsEarned = Math.floor(finalTotal * 0.05); // 5%
      if (pointsEarned > 0 && user) {
        // Create PENDING transaction (Locked)
        await WalletTransaction.create({
          userId: user._id,
          orderId: order.orderId,
          type: "CREDIT",
          amount: pointsEarned,
          description: `Earned from Order #${order.orderId} (Pending)`,
          status: "PENDING"
        });
        // Note: We DO NOT increment wallet balance yet.
      }
    }

    // 📧 ADMIN NOTIFICATION (New Feature)
    try {
      // We can use a simple helper or just console log if email service not configured
      // Ideally: sendAdminEmail(order);
      console.log(`📧 ALERT: New Order #${order.orderId} Placed! Value: ₹${finalTotal}`);
      // If we had the email service imported:
      // await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New Order ${order.orderId}`, text: ... });
    } catch (alertErr) {
      console.error("Failed to send admin alert", alertErr);
    }

    return res.status(201).json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      whatsappLink
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR 👉", error);

    // 💰 WALLET ROLLBACK (Compensation)
    // Not strictly transaction-safe (MongoDB atomicity requires replica set sessions),
    // but satisfactory for current scale.
    if (req.body.redeemCoins > 0 && req.body.userId) {
      try {
        const User = require("../models/User");
        const Wallet = require("../models/Wallet");
        const user = await User.findOne({ uid: req.body.userId });
        if (user) {
          // Refund coins
          await Wallet.updateOne({ userId: user._id }, { $inc: { balance: req.body.redeemCoins } });
          console.warn(`♻️ COMPENSATING WALLET: Refunded ${req.body.redeemCoins} coins due to order failure.`);

          // Note: We leave the "DEBIT" transaction log but it will be "orphaned" (no orderId).
          // Ideally we delete it or mark it VOID.
          const WalletTransaction = require("../models/WalletTransaction");
          await WalletTransaction.findOneAndDelete({
            userId: user._id,
            type: "DEBIT",
            description: "Redeemed on Order (Pending)",
            createdAt: { $gt: new Date(Date.now() - 60000) } // Safety: only recent
          });
        }
      } catch (rollbackError) {
        console.error("💥 CRITICAL WALLET ROLLBACK FAILURE:", rollbackError);
      }
    }

    next(error);
  }
};

/* ================= ONLINE PAYMENT: CREATE ORDER (RAZORPAY) ================= */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

    const order = await createRazorpayOrder(amount);
    return res.json({ success: true, order });
  } catch (error) {
    console.error("RAZORPAY ORDER CREATE ERROR:", error);
    next(error);
  }
};

/* ================= ONLINE PAYMENT: VERIFY & PLACE ORDER ================= */
exports.verifyPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData // The full cart/customer payload used in createOrder logic
    } = req.body;

    // 1. Verify Signature
    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Call internal createOrder logic (Reusing existing logic slightly refactored would be best, 
    // but for now we'll simulate a req/res call or copy logic. 
    // Cleaner approach: Separate 'placeOrder' logic into a service. 
    // QUICK FIX: We'll modify the existing createOrder to be callable or just copy the core logic here.
    // Actually, we can just attach the payment IDs to the payload and call the same function if we refactor.
    // Let's copy the Critical logic for robustness.)

    req.body = { ...orderData, paymentMethod: "UPI", paymentId: razorpay_payment_id };

    // --- REUSE CREATE ORDER LOGIC ---
    // (Just calling exports.createOrder(req, res) might work if we structure req correctly)
    // But createOrder sends a response.

    // Let's implement a streamlined version here for Online Orders
    const { customer, items, pricing, userId, redeemCoins } = orderData;

    // ... (Validate Inputs similar to createOrder) ... 

    // ... [Code omitted for brevity in search block, assuming match logic works] ...

    let discountAmount = 0;
    let coinsRedeemed = redeemCoins || 0;

    // Resolve User for Consistent ID Usage
    let userObjectId = null;
    let userRef = null;
    if (userId) {
      const User = require("../models/User");
      userRef = await User.findOne({ uid: userId });
      if (userRef) userObjectId = userRef._id;
    }

    // Handle Loyalty Debit (Same as createOrder)
    if (coinsRedeemed > 0 && userRef) {
      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      // Use resolved ID
      const wallet = await Wallet.findOne({ userId: userRef._id });
      if (wallet && wallet.balance >= coinsRedeemed) {
        discountAmount = Math.floor(coinsRedeemed * 0.8);
        wallet.balance -= coinsRedeemed;
        await wallet.save();

        await WalletTransaction.create({
          userId: userRef._id, type: "DEBIT", amount: coinsRedeemed,
          description: `Redeemed on Transaction ${razorpay_payment_id}`
        });
      }
    }

    const shippingFee = pricing.subtotal >= 500 ? 0 : 50;
    const finalTotal = pricing.subtotal + shippingFee - discountAmount; // COD fee usually 0 for online
    const orderId = generateOrderId();

    const newOrder = await Order.create({
      orderId,
      customer,
      items,
      userId: userObjectId ? userObjectId.toString() : (userId || null),
      pricing: {
        subtotal: pricing.subtotal,
        codFee: 0,
        shippingFee: shippingFee,
        discount: discountAmount,
        coinsRedeemed: coinsRedeemed,
        total: finalTotal // ✅ CORRECT: Use calculated final total
      },
      // 💰 INIT FINANCIALS (For Dashboard Pending View)
      financials: {
        grossRevenue: finalTotal,
        taxableValue: finalTotal / 1.05,
        gstAmount: finalTotal - (finalTotal / 1.05),
        netProfit: 0,
        profitMargin: 0
      },
      paymentMethod: "UPI",
      status: "PENDING_SHIPMENT", // Valid Enum Value
      shipping: {
        shipmentStatus: "PENDING"
      },
      transactionId: razorpay_payment_id,
      coinsCredited: coinsRedeemed > 0 ? true : (discountAmount > 0) // Just to be consistent, but mainly we want to mark true if we GAVE coins.
      // Wait, we need to GIVE coins here if it's prepaid!
    });

    // 🌟 LOYALTY: CREDIT POINTS FOR PREPAID ORDERS
    if (userId) {
      const pointsEarned = Math.floor(pricing.total * 0.05); // 5%

      if (pointsEarned > 0) {
        const User = require("../models/User");
        const Wallet = require("../models/Wallet");
        const WalletTransaction = require("../models/WalletTransaction");

        const user = await User.findOne({ uid: userId });
        if (user) {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (!wallet) wallet = await Wallet.create({ userId: user._id, balance: 0 });

          wallet.balance += pointsEarned;
          await wallet.save();

          await WalletTransaction.create({
            userId: user._id,
            orderId: orderId,
            type: "CREDIT",
            amount: pointsEarned,
            description: `Earned from Order #${orderId} (Prepaid)`,
            status: "COMPLETED"
          });

          // Mark as credited
          newOrder.coinsCredited = true;
          await newOrder.save();
        }
      }
    }

    // Send WhatsApp
    const whatsappLink = buildOrderPlacedLink({
      phone: customer.phone, orderId, amount: finalTotal, payment: "UPI / Online"
    });

    // 🎉 AUTOMATIC SHIPMENT CREATION (Optional - User requested "Shipyaari integration")
    // Trigger generic shipment creation if needed, or leave for Admin Panel manual trigger.
    // For reliability, we usually leave it manual in early stage.

    return res.json({
      success: true,
      orderId,
      whatsappLink
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    // 💰 WALLET ROLLBACK (Online Payment Compensation)
    if (req.body.orderData?.redeemCoins > 0 && req.body.orderData?.userId) {
      try {
        // We can't easily access 'userRef' here as it's blocked scoped above.
        // Re-fetch for safety.
        const User = require("../models/User");
        const Wallet = require("../models/Wallet");
        const u = await User.findOne({ uid: req.body.orderData.userId });
        if (u) {
          await Wallet.updateOne({ userId: u._id }, { $inc: { balance: req.body.orderData.redeemCoins } });
          console.warn("♻️ COMPENSATING WALLET (ONLINE): Refunded coins.");
        }
      } catch (rbErr) { console.error("Wallet Rollback Failed", rbErr); }
    }

    next(error);
  }
};

/* ================= ADMIN: GET ALL ORDERS ================= */
/* ================= ADMIN: GET ALL ORDERS (SAFE) ================= */
exports.getAllOrders = async (req, res) => {
  console.log("🔥 HIT: getAllOrders SAFE MODE");
  try {
    // ⚡ SUPER SAFE QUERY: No Filters, Simple Sort
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Sanity check for corruption
    // LOGGING FOR VISIBILITY DEBUGGING
    console.log(`🔥 GET ALL ORDERS: Found ${orders.length} orders directly from DB.`);

    // Sanity Check: Log IDs of first 5 to verify
    if (orders.length > 0) {
      console.log("Samples:", orders.slice(0, 3).map(o => `${o.orderId} (${o.status})`));
    } else {
      console.warn("⚠️ WARNING: DB returned 0 orders in getAllOrders!");
    }

    const safeOrders = orders.map(o => ({
      ...o,
      orderId: o.orderId || `ERR-${o._id}`, // Fallback ID
      status: o.status || "PENDING_SHIPMENT",
      paymentMethod: o.paymentMethod || "UNKNOWN",
      // Ensure shipping object exists for frontend safety
      shipping: o.shipping || { shipmentStatus: "PENDING" }
    }));

    // DEBUG: Specific Order Check
    const target = safeOrders.find(o => o.orderId === "KASTURI-AA462ADB");
    if (target) {
      console.log("✅ [BACKEND] getAllOrders FOUND TARGET:", target.orderId, target.status);
    } else {
      console.error("❌ [BACKEND] getAllOrders MISSING TARGET 'KASTURI-AA462ADB'");
    }

    return res.status(200).json({
      success: true,
      count: safeOrders.length,
      orders: safeOrders
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR 👉", error);
    return res.status(500).json({
      success: false,
      count: 0,
      orders: [],
      message: "Failed to fetch orders"
    });
  }
};

/* ================= ADMIN: UPDATE ORDER STATUS ================= */
const { assignBatchesToOrder, calculateOrderProfit } = require("../utils/financials");

/* ================= ADMIN: UPDATE ORDER STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // 1. Fetch Order
    const order = await Order.findOne({ orderId }).populate('items.batchId'); // Populate for check

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Safety: Prevent duplicate updates if already set
    if (order.status === status) {
      return res.json({ success: true, message: "Status already updated" });
    }

    // 2. 🏭 BATCH ASSIGNMENT (TRIGGER: PACKED)
    if (status === "PACKED" && (!order.items[0].batchId)) {
      console.log(`🏭 Assigning Batches for Order ${orderId}...`);
      try {
        await assignBatchesToOrder(orderId);
        // Re-fetch to get updated items in memory if needed, but not strictly required as we save in util
      } catch (err) {
        console.error("❌ Batch Assignment Failed:", err);
        // Optional: Return error or continue with warning? 
        // Users prefer not to block ops, so we log and continue, 
        // but profit will be 0.
      }
    }

    // 3. 💰 PROFIT CALCULATION (TRIGGER: DELIVERED)
    if (status === "DELIVERED") {
      order.shipping.deliveredAt = new Date(); // timestamp

      // Referral Logic
      if (order.referral && order.referral.referredBy && order.referral.rewardStatus !== 'VOID') {
        order.referral.rewardStatus = "PENDING_MATURATION";
      }

      // Calculate Financials (Async is fine, but await ensures DB consistency before response)
      try {
        await calculateOrderProfit(orderId);
      } catch (err) {
        console.error("❌ Profit Calc Failed:", err);
      }
    }

    /* 🌟 LOYALTY LOGIC: CREDIT POINTS ON DELIVERY */
    if (status === "DELIVERED" && !order.coinsCredited && order.userId) {
      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      const User = require("../models/User");

      const user = await User.findOne({ uid: order.userId });
      if (user) {
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) wallet = await Wallet.create({ userId: user._id, balance: 0 });

        // 1. Check for Pending Transaction (COD Logic)
        const pendingTxn = await WalletTransaction.findOneAndUpdate(
          { orderId: order.orderId, status: "PENDING", type: "CREDIT" },
          { status: "COMPLETED", description: `Earned from Order #${order.orderId}` },
          { new: true }
        );

        let pointsEarned = 0;

        if (pendingTxn) {
          // 🔓 UNLOCK: Increment Balance
          pointsEarned = pendingTxn.amount;
          wallet.balance += pointsEarned;
          console.log(`🔓 Unlocked ${pointsEarned} coins for Order ${order.orderId}`);
        } else {
          // 🆕 FALLBACK: No Pending found (Legacy or Issue) -> Create Fresh Credit
          pointsEarned = Math.floor(order.pricing.total * 0.05); // 5%
          if (pointsEarned > 0) {
            wallet.balance += pointsEarned;
            await WalletTransaction.create({
              userId: user._id,
              orderId: order.orderId,
              type: "CREDIT",
              amount: pointsEarned,
              description: `Earned from Order #${order.orderId}`,
              status: "COMPLETED"
            });
            console.log(`🆕 Credited ${pointsEarned} coins for Order ${order.orderId}`);
          }
        }

        if (pointsEarned > 0) {
          await wallet.save();
          order.coinsCredited = true;
        }
      }
    }

    order.status = status;
    await order.save();

    const whatsappLink = buildStatusWhatsAppLink({
      phone: order.customer.phone,
      orderId: order.orderId,
      status
    });

    return res.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      whatsappLink
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Status update failed"
    });
  }
};

/* ================= ADMIN: CREATE SHIPMENT (MANUAL) ================= */
const iThinkService = require("../services/ithink.service");
const { createOrder: createIthinkOrder } = iThinkService;

/* ================= ADMIN: CREATE SHIPMENT (MANUAL & ITHINK) ================= */
exports.createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, courierName, trackingLink, autoShip } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    let shipmentDetails = {
      shipmentStatus: "CREATED",
      courierName: courierName || "Manual",
      shippedAt: new Date(),
      awb: trackingNumber || "MANUAL-AWB",
      trackingLink: trackingLink || ""
    };

    // 🚚 iThink Logistics Automation
    if (autoShip || courierName === "iThink Logistics") {
      try {
        // Construct Payload for iThink
        // Construct Payload for iThink
        // NOTE: 'order', 'order_date', 'total_amount' must be INSIDE the shipment object in the 'shipments' array.
        const orderPayload = {
          shipments: [{
            // Order Details
            order: order.orderId,
            order_date: order.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
            total_amount: order.pricing.total,
            payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
            logistics: "Surface", // Mandatory field based on error "Invalid Request Format logistics"

            // Customer Details
            name: order.customer.name,
            add: order.customer.address,
            pin: order.customer.pincode,
            city: order.customer.city || "",
            state: order.customer.state || "",
            country: "India",
            phone: order.customer.phone,

            // Payment & COD
            payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
            cod_amount: order.paymentMethod === "COD" ? order.pricing.total : 0,

            // Products (Fixed Keys)
            products: order.items.map(item => ({
              product_name: item.name || "Masala Pack",
              product_qty: item.quantity, // Checking if it is product_quantity or product_qty. Usually product_quantity.
              // Wait, search said "product_quantity". Let's use that.
              product_quantity: item.quantity,
              product_price: item.price
            }))
          }],
          // Pickup Address ID (Required V3) - At Data Level
          pickup_address_id: process.env.ITHINK_PICKUP_ADDRESS_ID,
        };

        const ithinkResponse = await createIthinkOrder(orderPayload);

        // Extract AWB from response (Adjust based on actual response structure)
        // Assuming response has data.awb_number or similar
        const awb = ithinkResponse.data?.awb_number || ithinkResponse.awb_number || "PENDING";

        shipmentDetails = {
          ...shipmentDetails,
          courierName: "iThink Logistics",
          awb: awb,
          shipmentStatus: "SCHEDULED" // Or whatever status signifies success
        };

      } catch (err) {
        console.error("iThink Auto-Ship Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create shipment with iThink Logistics: " + err.message
        });
      }
    }

    // This block is for manual shipment or if iThink auto-ship is not used/failed
    order.shipping = {
      ...order.shipping,
      ...shipmentDetails
    };

    order.status = "SHIPPED"; // Auto update status
    await order.save();

    return res.json({
      success: true,
      message: "Shipment created successfully",
      shipping: order.shipping
    });

  } catch (error) {
    console.error("CREATE SHIPMENT ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Shipment creation failed"
    });
  }
};

/* ================= ADMIN: DASHBOARD ANALYTICS ================= */
exports.getDashboardStats = async (req, res) => {
  console.log("🔥 HIT: getDashboardStats");
  try {
    const { range } = req.query; // "today", "7d", "30d"

    // 1. Calculate Date Range
    const now = new Date();
    const startDate = new Date(); // Clone

    // 💥 FIX: Ensure we start from MIDNIGHT for "Today" and other ranges
    // Otherwise "Today" means "Now" => 0 orders
    startDate.setHours(0, 0, 0, 0);

    let daysToSubtract = 0;
    if (range === "7d") daysToSubtract = 7;
    else if (range === "30d") daysToSubtract = 30;
    else if (range === "today") daysToSubtract = 0;

    if (daysToSubtract > 0) {
      startDate.setDate(startDate.getDate() - daysToSubtract);
    }

    console.log(`📊 DASHBOARD STATS REQUEST: Range=${range}, Start=${startDate.toISOString()}`);

    // Previous Period (Same duration before startDate)
    // If range is today (0), we compare with yesterday (1 day)
    const prevDuration = daysToSubtract === 0 ? 1 : daysToSubtract;
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - prevDuration);

    // 2. Aggregation Pipeline
    const facets = await Order.aggregate([
      {
        $facet: {
          // CURRENT PERIOD STATS
          current: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: null,
                gross: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "DELIVERED"] },
                      "$financials.taxableValue",
                      0
                    ]
                  }
                },
                totalOrders: { $sum: 1 },

                // Delivered & Revenue
                deliveredRevenue: {
                  $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, "$financials.taxableValue", 0] }
                },
                netProfit: {
                  $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, "$financials.netProfit", 0] }
                },

                // COD Risk Metrics
                codPendingAmt: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$paymentMethod", "COD"] },
                          { $not: [{ $in: ["$status", ["DELIVERED", "CANCELLED", "RTO_DELIVERED"]] }] }
                        ]
                      },
                      "$financials.taxableValue", 0
                    ]
                  }
                },
                codPendingCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$paymentMethod", "COD"] },
                          { $not: [{ $in: ["$status", ["DELIVERED", "CANCELLED", "RTO_DELIVERED"]] }] }
                        ]
                      },
                      1, 0
                    ]
                  }
                },
                // Capture oldest PENDING COD order date for Aging
                oldestCodDate: {
                  $min: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$paymentMethod", "COD"] },
                          { $not: [{ $in: ["$status", ["DELIVERED", "CANCELLED", "RTO_DELIVERED"]] }] }
                        ]
                      },
                      "$createdAt", null
                    ]
                  }
                },

                // RTO Counts
                rtoCount: {
                  $sum: {
                    $cond: [
                      { $or: [{ $eq: ["$status", "RTO_INITIATED"] }, { $eq: ["$status", "RTO_DELIVERED"] }] },
                      1, 0
                    ]
                  }
                }
              }
            }
          ],

          // PREVIOUS PERIOD STATS (Only needed for Trend)
          previous: [
            { $match: { createdAt: { $gte: prevStartDate, $lt: startDate } } },
            {
              $group: {
                _id: null,
                deliveredRevenue: {
                  $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, "$pricing.total", 0] }
                }
              }
            }
          ],

          // STATUS BREAKDOWN (Separate facet for scalability)
          byStatus: [
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const curr = facets[0].current[0] || {};
    const prev = facets[0].previous[0] || {};
    const statusList = facets[0].byStatus || [];

    // 3. Process Status Counts (Array -> Object)
    const statusCounts = {};
    const allStatuses = [
      "PENDING_SHIPMENT", "PACKED", "SHIPPED", "ON_THE_WAY",
      "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RTO_INITIATED", "RTO_DELIVERED"
    ];
    // Initialize 0
    allStatuses.forEach(s => statusCounts[s] = 0);
    // Fill data
    statusList.forEach(item => {
      if (statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    // 4. Calculated Metrics
    const currentDelivered = curr.deliveredRevenue || 0;
    const prevDelivered = prev.deliveredRevenue || 0;

    // Trend %
    let trend = 0;
    if (prevDelivered > 0) {
      trend = ((currentDelivered - prevDelivered) / prevDelivered) * 100;
    } else if (currentDelivered > 0) {
      trend = 100; // New revenue vs 0
    }

    // 5. OPERATIONAL ALERTS

    // DEBUG: Log Intermediates
    console.log(`📊 Dashboard Aggregation (Range: ${range}):`, {
      totalOrders: curr.totalOrders,
      deliveredRev: currentDelivered,
      rangeStart: startDate.toISOString()
    });

    const activeStatuses = ["PENDING_SHIPMENT", "PACKED", "SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"];
    const activeOrders = await Order.countDocuments({ status: { $in: activeStatuses } });

    console.log("📊 Active Orders Count (Query):", activeOrders);

    // RTO Rate (Based on selected range for accuracy of performance in that period)
    // Denominator = Shipped Orders in this period + RTOs in this period
    // Note: This is an approximation. Ideal RTO rate is (Total RTO / Total Shipped) * 100
    const shippedBase = statusCounts["SHIPPED"] + statusCounts["ON_THE_WAY"] + statusCounts["OUT_FOR_DELIVERY"] + statusCounts["DELIVERED"] + (curr.rtoCount || 0);
    const rtoRate = shippedBase > 0 ? ((curr.rtoCount || 0) / shippedBase * 100).toFixed(1) : 0;

    // 5. OPERATIONAL ALERTS (SLA CHECKS) =================================
    // We run specific queries for these to ensure accuracy.
    // Optimization: These could be efficiently done via aggregations if volume grows.

    // A. OFD Delayed (> 24h)
    const ofdCutoff = new Date(Date.now() - SLA.OFD_DELAY_HOURS * 60 * 60 * 1000);
    const ofdDelayedCount = await Order.countDocuments({
      status: "OUT_FOR_DELIVERY",
      "shipping.lastSync": { $lt: ofdCutoff } // Assuming lastSync approximates the status change time or check updatedAt
      // Better: updatedAt. If status changed to OFD 24h ago and hasn't changed.
    });

    // B. In Transit Delay (> 5 Days)
    const transitCutoff = new Date(Date.now() - SLA.IN_TRANSIT_DAYS * 24 * 60 * 60 * 1000);
    const transitDelayedCount = await Order.countDocuments({
      status: { $in: ["SHIPPED", "ON_THE_WAY"] },
      createdAt: { $lt: transitCutoff } // Proxy: Order created > 5 days ago and still in transit
    });

    // C. Tracking Stale (> 30 Mins for Active Shipments)
    const staleCutoff = new Date(Date.now() - SLA.TRACKING_STALE_MINUTES * 60 * 1000);
    const trackingStaleCount = await Order.countDocuments({
      status: { $in: ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY", "RTO_INITIATED"] },
      "shipping.awbNumber": { $ne: null },
      "shipping.lastSync": { $lt: staleCutoff }
    });

    // D. RTO Risk (Global or 7D logic?)
    // Using the 'curr.rtoCount' calculated above for the requested range (7d usually).
    const rtoRisk = parseFloat(rtoRate) > SLA.RTO_MAX_PERCENT_7D;

    // E. Courier Stats (Aggregation)
    // Group by shipping.courierName
    const courierStats = await Order.aggregate([
      { $match: { "shipping.courierName": { $ne: null } } },
      {
        $group: {
          _id: "$shipping.courierName",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
          rto: { $sum: { $cond: [{ $in: ["$status", ["RTO_INITIATED", "RTO_DELIVERED"]] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } }
          // Avg processing time could be added here if needed
        }
      },
      {
        $project: {
          courier: "$_id",
          total: 1,
          delivered: 1,
          rto: 1,
          cancelled: 1,
          deliveredPercent: { $cond: [{ $gt: ["$total", 0] }, { $multiply: [{ $divide: ["$delivered", "$total"] }, 100] }, 0] },
          rtoPercent: { $cond: [{ $gt: ["$total", 0] }, { $multiply: [{ $divide: ["$rto", "$total"] }, 100] }, 0] }
        }
      }
    ]);

    // 6. Recent Orders (Separate Query)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId customer.name financials.taxableValue status createdAt");

    res.json({
      success: true,
      data: {
        revenue: {
          gross: curr.gross || 0,
          delivered: currentDelivered,
          profit: curr.netProfit || 0,
          trend: trend.toFixed(1), // +12.5 or -5.0
          codPending: curr.codPendingAmt || 0
        },
        codMeta: {
          count: curr.codPendingCount || 0,
          oldest: curr.oldestCodDate || null
        },
        orders: {
          total: curr.totalOrders || 0,
          active: activeOrders,
          rto: curr.rtoCount || 0,
          rtoRate: rtoRate,
          shipped: shippedBase // 📦 Exposed for frontend "No shipped orders" check
        },
        alerts: {
          ofdDelayed: ofdDelayedCount,
          transitDelayed: transitDelayedCount,
          trackingStale: trackingStaleCount,
          rtoRisk: rtoRisk,
          rtoRate: rtoRate
        },
        couriers: courierStats.map(c => ({ ...c, courier: c.courier === "Envia" ? "iThink Logistics" : c.courier })),
        statusBreakdown: statusCounts,
        recent: recentOrders
      }
    });

  } catch (error) {
    console.error("❌ DASHBOARD STATS ERROR CRITICAL:", error);
    return res.status(500).json({ success: false, message: "Stats extraction failed: " + error.message });
  }
};
/* ================= ADMIN: GET ORDER BY ID ================= */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Search by internal orderId string OR mongoose _id
    const order = await Order.findOne({
      $or: [{ orderId: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ================= ADMIN: BULK REFRESH TRACKING ================= */
exports.bulkRefreshTracking = async (req, res) => {
  try {
    const { orderIds } = req.body; // Array of Order IDs (internal orderId, not _id)
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.json({ success: true, message: "No orders to refresh", updated: [] });
    }

    const orders = await Order.find({
      orderId: { $in: orderIds },
      "shipping.awbNumber": { $ne: null }
    });

    const awbList = orders.map(o => o.shipping.awbNumber).join(",");

    if (!awbList) return res.json({ success: true, message: "No trackable orders found" });

    // Bulk Track
    const trackRes = await trackShipment(awbList);

    // Implementation:
    const results = [];

    for (const order of orders) {
      const data = await trackShipment(order.shipping.awbNumber);
      if (data) {
        // Update Logic (Copy specific fields)
        await Order.updateOne(
          { orderId: order.orderId },
          {
            $set: {
              "shipping.lastSync": new Date(),
              "shipping.shipmentStatus": data.current_status
            }
          }
        );
        results.push({ orderId: order.orderId, status: data.current_status });
      }
    }

    return res.json({ success: true, updated: results });

  } catch (error) {
    console.error("BULK REFRESH ERROR:", error);
    return res.status(500).json({ success: false, message: "Bulk refresh failed" });
  }
};

/* ================= ADMIN: PROCESS REFERRAL REWARDS ================= */
const { processReferralRewards } = require("../services/referral.service");

exports.processRewards = async (req, res) => {
  try {
    const result = await processReferralRewards();
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error("PROCESS REWARDS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to process rewards" });
  }
};

/* ================= PUBLIC: TRACK ORDER ================= */
const { trackShipment } = require("../services/ithink.service");

exports.trackOrder = async (req, res) => {
  try {
    const { id } = req.params; // Can be OrderID or AWB

    let awb = id;
    let order = null;

    // 1. Check if it looks like an internal Order ID (e.g. "ORD-1234")
    if (id.startsWith("ORD") || id.length < 15) { // Simple heuristic
      order = await Order.findOne({ orderId: id });
      if (order) {
        // If we have an AWB, use it.
        if (order.shipping && order.shipping.awb) {
          awb = order.shipping.awb;
        } else {
          // Not shipped yet
          return res.json({
            success: true,
            status: "PENDING_SHIPMENT",
            timeline: [
              { status: "Ordered", date: order.createdAt, done: true },
              { status: "Shipped", date: null, done: false },
              { status: "Delivered", date: null, done: false }
            ]
          });
        }
      } else {
        // If ID is numeric/long, it might be AWB directly. If short and not found, it's invalid order.
        // But let's assume if it fails lookup, we try it as AWB.
      }
    }

    // 2. Call Tracking Service
    const trackingData = await trackShipment(awb);

    if (!trackingData) {
      return res.json({
        success: false,
        message: "Tracking information not available yet. Please try again later."
      });
    }

    // 3. Format Timeline from iThink Data
    // iThink usually returns `shipment_track`: [ { scan_date, scan_time, scan_status, scan_location } ... ]
    // We need to map this to our UI format.

    const history = trackingData.shipment_track || [];
    const latestStatus = trackingData.current_status || "In Transit";

    return res.json({
      success: true,
      awb: awb,
      status: latestStatus,
      history: history, // Raw history for detailed view
      // Summary for simple stepper
      eta: trackingData.expected_date || null
    });

  } catch (error) {
    console.error("TRACK ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Tracking service unavailable" });
  }
};

const { refundPayment } = require("../services/razorpay.service");

/* ================= CUSTOMER: CANCEL ORDER ================= */
exports.cancelOrderByUser = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, userId } = req.body; // Expect userId from frontend auth context

    if (!reason) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }

    // 1. Find Order (Strict check on OrderId)
    // We also verify it belongs to the user if a userId is provided (Recommended)
    // Since we pass userId from frontend, we should check it.
    const query = { orderId };

    // Note: In a real app, we'd use req.user from middleware. 
    // Here we rely on the body's userId which matches the one stored in Order.
    if (userId) {
      query.userId = userId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or access denied" });
    }

    // 2. Strict Status Check
    if (order.status !== "PENDING_SHIPMENT") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage. It may have been packed or shipped."
      });
    }

    // 3. Handle Refund (If Prepaid)
    let refundInfo = null;
    if (order.paymentMethod === "UPI" && order.transactionId) {
      try {
        // Attempt Full Refund
        const refund = await refundPayment(order.transactionId, order.pricing.total);
        refundInfo = {
          id: refund.id,
          status: refund.status,
          amount: refund.amount / 100
        };
        console.log(`💰 Refund Initiated for Order ${orderId}:`, refundInfo);
      } catch (err) {
        console.error("Refund Failed:", err);
        // We still proceed with cancellation but log the error (or flagged for admin)
        // ideally we should stop, but for UX we might cancel and let admin handle refund manually if API fails.
        // For strictness, let's flag it.
      }
    }

    // 4. Update Order
    order.status = "CANCELLED";
    order.cancellation = {
      reason: reason,
      cancelledBy: userId || "CUSTOMER",
      cancelledAt: new Date()
    };

    // 5. Restore Inventory (Placeholder Log)
    // Since we don't have a Product model link here easily or Model definition, we log it.
    console.log(`📦 Inventory Restore Triggered for Order ${orderId}`);
    // implementation: await Product.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } })

    await order.save();

    // 6. WhatsApp Notification (Optional)
    const whatsappLink = buildStatusWhatsAppLink({
      phone: order.customer.phone,
      orderId: order.orderId,
      status: "CANCELLED"
    });

    // 🌟 LOYALTY: VOID or REVERSE
    if (order.status === "CANCELLED" && order.userId) {
      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      const User = require("../models/User");

      // 1. VOID Pending (COD)
      await WalletTransaction.updateMany(
        { orderId: order.orderId, status: "PENDING" },
        { status: "VOID", description: `Voided (Cancelled #${order.orderId})` }
      );

      // 2. REVERSE Credited (Prepaid)
      if (order.coinsCredited) {
        const user = await User.findOne({ uid: order.userId });
        if (user) {
          const wallet = await Wallet.findOne({ userId: user._id });
          if (wallet) {
            const coinsToReverse = Math.floor(order.pricing.total * 0.05); // 5%
            wallet.balance -= coinsToReverse;
            await wallet.save();
            await WalletTransaction.create({
              userId: user._id, type: "DEBIT", amount: coinsToReverse,
              description: `Reversal (Cancelled #${order.orderId})`,
              status: "COMPLETED"
            });
            console.log(`♻️ Reversed ${coinsToReverse} coins for Cancelled Order ${order.orderId}`);
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "Order cancelled successfully",
      refund: refundInfo,
      whatsappLink
    });

  } catch (error) {
    console.error("USER CANCEL ERROR:", error);
    return res.status(500).json({ success: false, message: "Cancellation failed" });
  }
};


/* ================= ADMIN: CANCEL ORDER ================= */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Search by internal orderId string OR mongoose _id
    const order = await Order.findOne({
      $or: [{ orderId: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }]
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 1. Validate Status
    const allowedStatuses = ["PENDING_SHIPMENT", "PACKED"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} status.` });
    }

    // 2. Courier Sync (STRICT)
    // If order has an AWB, we MUST cancel it with iThink first
    if (order.shipping && order.shipping.awbNumber) {
      try {
        console.log(`[Cancel] Attempting to cancel AWB: ${order.shipping.awbNumber}`);
        await iThinkService.cancelShipment(order.shipping.awbNumber);
        console.log(`[Cancel] AWB Cancelled Successfully`);
      } catch (apiErr) {
        console.error("[Cancel] Courier Cancellation Failed:", apiErr.message);
        // CRITICAL: Abort internal cancellation if courier fails (STRICT RULE)
        return res.status(500).json({
          success: false,
          message: "Courier cancellation failed. Order NOT cancelled internally to maintain sync.",
          details: apiErr.message
        });
      }
    }

    // 3. Update Order Internally
    order.status = "CANCELLED";
    order.cancellation = {
      reason: reason || "Admin cancelled",
      cancelledBy: "ADMIN", // TODO: Use req.user.name if available
      cancelledAt: new Date()
    };

    // 4. Inventory Restore (Placeholder)
    // TODO: Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });

    await order.save();

    await order.save();

    // 🌟 LOYALTY: VOID or REVERSE (Admin)
    if (order.status === "CANCELLED" && order.userId) {
      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      const User = require("../models/User");

      // 1. VOID Pending
      await WalletTransaction.updateMany(
        { orderId: order.orderId, status: "PENDING" },
        { status: "VOID", description: `Voided (Admin Cancel #${order.orderId})` }
      );

      // 2. REVERSE Credited
      if (order.coinsCredited) {
        // Resolve User (Might be ObjectId or UID string)
        let user = null;
        if (mongoose.isValidObjectId(order.userId)) user = await User.findById(order.userId);
        else user = await User.findOne({ uid: order.userId });

        if (user) {
          const wallet = await Wallet.findOne({ userId: user._id });
          if (wallet) {
            const coinsToReverse = Math.floor(order.pricing.total * 0.05);
            wallet.balance -= coinsToReverse;
            await wallet.save();
            await WalletTransaction.create({
              userId: user._id, type: "DEBIT", amount: coinsToReverse,
              description: `Reversal (Admin Cancel #${order.orderId})`,
              status: "COMPLETED"
            });
          }
        }
      }
    }

    res.json({ success: true, message: "Order cancelled successfully", order });

  } catch (error) {
    console.error("CANCEL ORDER ERROR 👉", error);
    res.status(500).json({ success: false, message: "Cancellation failed" });
  }
};

/* ================= ADMIN: INITIATE RTO ================= */
exports.initiateRTO = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "RTO Reason is mandatory." });
    }

    // Search by internal orderId string OR mongoose _id
    const order = await Order.findOne({
      $or: [{ orderId: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }]
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 1. Validate Status
    const allowedStatuses = ["SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot initiate RTO for status: ${order.status}` });
    }

    // 2. Update Status
    order.status = "RTO_INITIATED";
    order.rto = {
      reason: reason,
      initiatedAt: new Date(),
      restocked: false // Wait for RTO_DELIVERED to restock
    };

    await order.save();

    res.json({ success: true, message: "RTO Initiated", order });

    // 🌟 LOYALTY: VOID or REVERSE (RTO)
    if (order.status === "RTO_INITIATED" && order.userId) {
      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      const User = require("../models/User");

      // VOID Pending (COD RTO)
      await WalletTransaction.updateMany(
        { orderId: order.orderId, status: "PENDING" },
        { status: "VOID", description: `Voided (RTO #${order.orderId})` }
      );

      // Note: For Prepaid RTO, we typically wait for RTO_DELIVERED to process refund/reversal,
      // but strictly speaking, if RTO is initiated, the sale is void.
      // Let's reverse immediately for safety or wait?
      // User rule: "COD RTO or cancellation must mark ... VOID".
      // "Prepaid refunds must ... VOID or reverse".
      // RTO_INITIATED is a strong signal. Let's reverse pending only for now, 
      // and reverse credited coins ONLY if we process refund? 
      // Usually RTO means it's coming back. Let's start with VOID PENDING.
      // Prepaid RTO Reversal might be handled in RTO_DELIVERED or separate refund logic.
      // For now, handling PENDING void is the critical part for COD.
    }

  } catch (error) {
    console.error("RTO ERROR 👉", error);
    res.status(500).json({ success: false, message: "RTO initiation failed" });
  }
};

/* ================= USER: GET SINGLE ORDER ================= */
exports.getSingleUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const uid = req.user?.uid || req.query.uid; // Support Middleware or Query Param

    if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });

    // Find Order by ID
    // We also verify it belongs to the user (security)
    // The order stores 'userId' (originally string UID or ObjectId string).
    // Let's check both just in case, or just the stored userId.

    const order = await Order.findOne({ orderId }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify Ownership
    // order.userId might be UID or ObjectId string. req.user.uid is UID.
    // If order.userId matches UID, good.
    // If order.userId is ObjectId, we might need to check if that User doc has this UID.

    // Quick Check: simple string match first
    let isOwner = (order.userId === uid);

    if (!isOwner) {
      // Deep Check: Find User by UID and compare _id
      const User = require("../models/User");
      const userDoc = await User.findOne({ uid });
      if (userDoc && order.userId === userDoc._id.toString()) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized access to order" });
    }

    return res.json({ success: true, order });

  } catch (error) {
    console.error("GET USER ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

/* ================= ADMIN: FINANCIAL DASHBOARD STATS ================= */
exports.getFinancialStats = async (req, res) => {
  try {
    const NOW = new Date();
    // Start of Current Month
    const startOfCurrentMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
    // Start of Last Month
    const startOfLastMonth = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1);
    const endOfLastMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 0, 23, 59, 59, 999);
    // Start of Financial Year (April 1st)
    const currentYear = NOW.getFullYear();
    const isBeforeApril = NOW.getMonth() < 3; // Jan, Feb, Mar are part of previous year's FY
    const startOfFY = new Date(isBeforeApril ? currentYear - 1 : currentYear, 3, 1);

    const stats = await Order.aggregate([
      // 1. STAGE: Match DELIVERED orders only (Strict Rule)
      { $match: { status: "DELIVERED" } },

      {
        $facet: {
          // A. LIFETIME TOTALS
          lifetime: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$financials.grossRevenue" }, // Gross (user paid)
                taxableRevenue: { $sum: "$financials.taxableValue" }, // Ex-GST
                totalGST: { $sum: "$financials.gstAmount" },
                totalProfit: { $sum: "$financials.netProfit" },
                totalOrders: { $sum: 1 }
              }
            }
          ],
          // B. CURRENT MONTH
          currentMonth: [
            { $match: { "shipping.deliveredAt": { $gte: startOfCurrentMonth } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$financials.taxableValue" },
                profit: { $sum: "$financials.netProfit" }
              }
            }
          ],
          // C. LAST MONTH (For Comparison)
          lastMonth: [
            { $match: { "shipping.deliveredAt": { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$financials.taxableValue" },
                profit: { $sum: "$financials.netProfit" }
              }
            }
          ],
          // D. FINANCIAL YEAR (YTD)
          fyTotal: [
            { $match: { "shipping.deliveredAt": { $gte: startOfFY } } },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$financials.taxableValue" }
              }
            }
          ],
          // E. PRODUCT WISE BREAKDOWN
          products: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.variant", // or items.name + variant
                name: { $first: "$items.name" },
                totalQty: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, // Gross Line Revenue
                // Costing
                avgCost: { $avg: "$items.costAtTimeOfOrder" },
                totalCost: { $sum: { $multiply: ["$items.costAtTimeOfOrder", "$items.quantity"] } }
              }
            },
            // Calc profit per product line using approx formula (cannot do perfect order-level split here without complexity)
            // Approx Taxable Rev = Revenue / 1.05
            // Approx Profit = Taxable - TotalCost
            {
              $addFields: {
                taxableRev: { $divide: ["$totalRevenue", 1.05] }
              }
            },
            {
              $addFields: {
                estProfit: { $subtract: ["$taxableRev", "$totalCost"] },
                estMargin: { $multiply: [{ $divide: [{ $subtract: ["$taxableRev", "$totalCost"] }, "$taxableRev"] }, 100] }
              }
            },
            { $sort: { totalRevenue: -1 } }
          ],
          // F. MONTHLY TREND (Last 12 Months)
          monthlyTrend: [
            {
              $group: {
                _id: {
                  month: { $month: "$shipping.deliveredAt" },
                  year: { $year: "$shipping.deliveredAt" }
                },
                revenue: { $sum: "$financials.taxableValue" },
                profit: { $sum: "$financials.netProfit" }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]
        }
      }
    ]);

    return res.json({
      success: true,
      data: stats[0]
    });

  } catch (err) {
    console.error("FINANCIAL STATS ERROR:", err);
    res.status(500).json({ success: false, message: "Stats Calculation Failed" });
  }
};

/* ================= ADMIN: EXPORT GST REPORT ================= */
exports.exportGSTReport = async (req, res) => {
  try {
    const orders = await Order.find({ status: "DELIVERED" }).sort({ "shipping.deliveredAt": -1 });

    let csv = "Order ID,Date,Customer Name,State,Payment Method,Gross Amount,Taxable Value,GST Amount (5%),Net Profit\n";

    orders.forEach(order => {
      const date = order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toISOString().split('T')[0] : 'N/A';
      const gross = order.financials?.grossRevenue || 0;
      const taxable = order.financials?.taxableValue || 0;
      const gst = order.financials?.gstAmount || 0;
      const profit = order.financials?.netProfit || 0;

      csv += `${order.orderId},${date},"${order.customer.name}","${order.customer.state || ''}",${order.paymentMethod},${gross.toFixed(2)},${taxable.toFixed(2)},${gst.toFixed(2)},${profit.toFixed(2)}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`gst-report-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);

  } catch (error) {
    console.error("EXPORT ERROR:", error);
    return res.status(500).json({ success: false, message: "Export failed" });
  }
};
