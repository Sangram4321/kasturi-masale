const crypto = require("crypto");
const User = require("../models/User");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const REWARDS = require("../config/rewards");

/* ================= GENERATE CODE ================= */
// Secure, Random, Short (8 chars) - Low Collision
exports.generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
        exists = await User.findOne({ referralCode: code });
    }
    return code;
};

/* ================= VALIDATE REFERRAL ================= */
exports.validateReferralCode = async (code, userId, cartTotal, customerPhone, customerAddress) => {
    if (!code) return { valid: false };

    // 1. Check Code Existence
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) {
        return { valid: false, message: "Invalid Referral Code" };
    }

    // 2. Self Referral Check
    if (userId && referrer.uid === userId) {
        return { valid: false, message: "Cannot use your own referral code" };
    }

    // 3. Min Order Value
    if (cartTotal < REWARDS.REFERRAL_MIN_ORDER_VALUE) {
        return { valid: false, message: `Minimum order value of ₹${REWARDS.REFERRAL_MIN_ORDER_VALUE} required for referral discount` };
    }

    // 4. New User / First Order Check (Strict)
    // If user is logged in, check their order history
    if (userId) {
        const orderCount = await Order.countDocuments({ userId: userId });
        if (orderCount > 0) {
            return { valid: false, message: "Referral code valid only for first order" };
        }
    }

    // 5. Abuse Check: Household / Address Match (Advanced)
    // Check if Referrer has ever used this phone or address in THEIR orders
    // (Meaning: I am referring myself using a different account but same address)
    if (customerPhone || customerAddress) {
        const abuseMatch = await Order.findOne({
            userId: referrer.uid, // Look at Referrer's orders
            $or: [
                { "customer.phone": customerPhone },
                // Simple string inclusion check for address (fuzzy)
                // In production, use normalized address hash. For phase 1, direct match or partial.
                // We'll trust exact phone match more. Address is tricky due to formatting.
            ]
        });

        if (abuseMatch) {
            console.warn(`Referral Abuse Detected: ${code} used by ${customerPhone} (Linked to Referrer)`);
            return { valid: false, message: "Referral not applicable for this address/phone" };
        }
    }

    return {
        valid: true,
        discount: REWARDS.REFERRAL_FRIEND_DISCOUNT,
        referrerId: referrer._id,
        referrerUid: referrer.uid
    };
};

/* ================= PROCESS REWARDS (ADMIN TRIGGER) ================= */
exports.processReferralRewards = async () => {
    const today = new Date();
    // Orders that are DELIVERED and PENDING_MATURATION
    // and Delivered Date + Return Window <= Today

    // 1. Find Candidates
    // Note: We need deliveredAt. If missing, fallback to updatedAt.
    const orders = await Order.find({
        "referral.rewardStatus": "PENDING_MATURATION",
        status: "DELIVERED"
    });

    let processedCount = 0;
    let coinsCreditedTotal = 0;

    for (const order of orders) {
        const deliveredAt = order.shipping.deliveredAt || order.updatedAt;
        const maturationDate = new Date(deliveredAt);
        maturationDate.setDate(maturationDate.getDate() + REWARDS.REFERRAL_RETURN_DAYS);

        if (today >= maturationDate) {
            // ✅ MATURED -> Credit Referrer
            if (order.referral.referredBy) {
                const referrer = await User.findById(order.referral.referredBy);
                if (referrer) {
                    // Credit Wallet
                    let wallet = await Wallet.findOne({ userId: referrer._id });
                    if (!wallet) wallet = await Wallet.create({ userId: referrer._id, balance: 0 });

                    const amount = REWARDS.REFERRAL_REFERRER_COINS;
                    wallet.balance += amount;
                    await wallet.save();

                    // Calculate Expiry
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + REWARDS.REFERRAL_COIN_EXPIRY_DAYS);

                    // Ledger
                    await WalletTransaction.create({
                        userId: referrer._id,
                        orderId: order.orderId,
                        type: "CREDIT",
                        amount: amount,
                        description: `Referral Bonus: Friend placed Order #${order.orderId}`,
                        expiryDate: expiryDate
                    });

                    // Update Referral Status
                    order.referral.rewardStatus = "CREDITED";
                    await order.save();

                    processedCount++;
                    coinsCreditedTotal += amount;
                }
            }
        }
    }

    return { processedCount, coinsCreditedTotal };
};
