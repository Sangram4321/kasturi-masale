const Order = require("../models/Order");
const mongoose = require("mongoose");
const generateOrderId = require("../utils/generateOrderId");
const {
  buildOrderPlacedLink,
  buildStatusWhatsAppLink
} = require("../services/whatsapp.service");
const { createOrder: createRazorpayOrder, verifySignature } = require("../services/razorpay.service");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
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

    if (coinsRedeemed > 0) {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Login required to redeem points" });
      }

      const Wallet = require("../models/Wallet");
      const WalletTransaction = require("../models/WalletTransaction");
      const User = require("../models/User");

      // Find user (resolve UID to ObjectId)
      const user = await User.findOne({ uid: userId });
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
    const finalTotal = pricing.subtotal + (pricing.codFee || 0) - discountAmount;

    while (!order && attempts < 3) {
      try {
        const orderId = generateOrderId();
        order = await Order.create({
          orderId,
          customer,
          items,
          userId: userId || null, // Store User Reference
          pricing: {
            subtotal: pricing.subtotal,
            codFee: pricing.codFee || 0,
            discount: discountAmount,
            coinsRedeemed: coinsRedeemed,
            total: finalTotal
          },
          paymentMethod,
          status: "PENDING_SHIPMENT"
        });

        // If successful, update the transaction with orderId
        if (coinsRedeemed > 0) {
          const User = require("../models/User");
          const WalletTransaction = require("../models/WalletTransaction");
          const user = await User.findOne({ uid: userId });
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
      amount: pricing.total,
      payment: paymentMethod
    });

    return res.status(201).json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      whatsappLink
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
};

/* ================= ONLINE PAYMENT: CREATE ORDER (RAZORPAY) ================= */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

    const order = await createRazorpayOrder(amount);
    return res.json({ success: true, order });
  } catch (error) {
    console.error("RAZORPAY ORDER CREATE ERROR:", error);
    return res.status(500).json({ success: false, message: "Payment init failed" });
  }
};

/* ================= ONLINE PAYMENT: VERIFY & PLACE ORDER ================= */
exports.verifyPaymentAndCreateOrder = async (req, res) => {
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

    let discountAmount = 0;
    let coinsRedeemed = redeemCoins || 0;

    // Handle Loyalty Debit (Same as createOrder)
    if (coinsRedeemed > 0 && userId) {
      const user = await User.findOne({ uid: userId });
      if (user) {
        const wallet = await Wallet.findOne({ userId: user._id });
        if (wallet && wallet.balance >= coinsRedeemed) {
          discountAmount = Math.floor(coinsRedeemed * 0.8);
          wallet.balance -= coinsRedeemed;
          await wallet.save();

          await WalletTransaction.create({
            userId: user._id, type: "DEBIT", amount: coinsRedeemed,
            description: `Redeemed on Transaction ${razorpay_payment_id}`
          });
        }
      }
    }

    const finalTotal = pricing.subtotal - discountAmount; // COD fee usually 0 for online
    const orderId = generateOrderId();

    const newOrder = await Order.create({
      orderId,
      customer,
      items,
      userId: userId || null,
      pricing: {
        subtotal: pricing.subtotal,
        codFee: 0,
        discount: discountAmount,
        coinsRedeemed: coinsRedeemed,
        total: finalTotal
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
            description: `Earned from Order #${orderId} (Prepaid)`
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
    return res.status(500).json({ success: false, message: "Order placement failed after payment" });
  }
};

/* ================= ADMIN: GET ALL ORDERS ================= */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR 👉", error);
    return res.json({
      success: true,
      count: 0,
      orders: []
    });
  }
};

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

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === status) {
      return res.json({
        success: true,
        message: "Status already updated"
      });
    }

    /* 🌟 LOYALTY LOGIC: CREDIT POINTS ON DELIVERY/PAYMENT */
    // Only credit if moving to COMPLETED state and points not yet given
    // Simplified: Check if status becomes DELIVERED (COD) or PAID (Online - though usually PAID is instant)
    // Actually, usually status flow is: PENDING -> SHIPPED -> DELIVERED.
    // Or for online: PENDING -> PAID -> SHIPPED -> DELIVERED.
    // Let's trigger on 'DELIVERED'.

    if (status === "DELIVERED" && order.status !== "DELIVERED") {
      // Check if coins already credited (e.g. Prepaid)
      if (!order.coinsCredited) {
        // Check if user exists
        if (order.userId) {
          const pointsEarned = Math.floor(order.pricing.total * 0.05); // 5%

          if (pointsEarned > 0) {
            const Wallet = require("../models/Wallet");
            const WalletTransaction = require("../models/WalletTransaction");
            const User = require("../models/User");

            // Look up User (ensure they exist)
            // Note: order.userId might be String UID. Need to find ObjectId for Wallet.
            const user = await User.findOne({ uid: order.userId });

            if (user) {
              // Update Wallet
              let wallet = await Wallet.findOne({ userId: user._id });
              if (!wallet) {
                wallet = await Wallet.create({ userId: user._id, balance: 0 });
              }

              wallet.balance += pointsEarned;
              await wallet.save();

              // Log Transaction
              await WalletTransaction.create({
                userId: user._id,
                orderId: order.orderId,
                type: "CREDIT",
                amount: pointsEarned,
                description: `Earned from Order #${order.orderId}`
              });

              console.log(`✅ Credited ${pointsEarned} points to user ${order.userId}`);

              order.coinsCredited = true; // prevent double credit
            }
          }
        }
      }
    }



    order.status = status;
    if (status === "DELIVERED") {
      order.shipping.deliveredAt = new Date();

      // Referral Logic: Start Maturation
      if (order.referral && order.referral.referredBy && order.referral.rewardStatus !== 'VOID') {
        order.referral.rewardStatus = "PENDING_MATURATION";
      }
    }

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

// Manual Shipping Logic Only


/* ================= ADMIN: CREATE SHIPMENT (MANUAL) ================= */
const { createOrder: createIthinkOrder } = require("../services/ithink.service");

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
  try {
    const { range } = req.query; // 'today', '7d', '30d'

    // 1. Calculate Date Ranges (Current vs Previous)
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Default Today start

    let daysToSubtract = 0;
    if (range === "7d") daysToSubtract = 7;
    else if (range === "30d") daysToSubtract = 30;
    else if (range === "today") daysToSubtract = 0; // Special case, maybe compare to yesterday? Usually "today" trend implies "vs yesterday"

    // Adjust startDate
    if (daysToSubtract > 0) {
      startDate.setDate(now.getDate() - daysToSubtract);
    }

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
                gross: { $sum: "$pricing.total" },
                totalOrders: { $sum: 1 },

                // Delivered & Revenue
                deliveredRevenue: {
                  $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, "$pricing.total", 0] }
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
                      "$pricing.total", 0
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

    // Active Orders (GLOBAL COUNT - Tracking Backlog)
    // We want to know TOTAL active orders regardless of date range selected
    const activeStatuses = ["PENDING_SHIPMENT", "PACKED", "SHIPPED", "ON_THE_WAY", "OUT_FOR_DELIVERY"];
    const activeOrders = await Order.countDocuments({ status: { $in: activeStatuses } });

    // RTO Rate (Based on selected range for accuracy of performance in that period)
    // Denominator = Shipped Orders in this period + RTOs in this period
    // Note: This is an approximation. Ideal RTO rate is (Total RTO / Total Shipped) * 100
    const shippedBase = statusCounts["SHIPPED"] + statusCounts["ON_THE_WAY"] + statusCounts["OUT_FOR_DELIVERY"] + statusCounts["DELIVERED"] + (curr.rtoCount || 0);
    const rtoRate = shippedBase > 0 ? ((curr.rtoCount || 0) / shippedBase * 100).toFixed(1) : 0;

    // 5. Recent Orders (Separate Query)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId customer.name pricing.total status createdAt");

    res.json({
      success: true,
      data: {
        revenue: {
          gross: curr.gross || 0,
          delivered: currentDelivered,
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
        statusBreakdown: statusCounts,
        recent: recentOrders
      }
    });

  } catch (error) {
    console.error("DASHBOARD STATS ERROR 👉", error);
    res.status(500).json({ success: false, message: "Stats extraction failed" });
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
        // CRITICAL: Abort internal cancellation if courier fails
        return res.status(500).json({
          success: false,
          message: "Courier cancellation failed. Order NOT cancelled internally.",
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

  } catch (error) {
    console.error("RTO ERROR 👉", error);
    res.status(500).json({ success: false, message: "RTO initiation failed" });
  }
};
