require("dotenv").config();

module.exports = {
    // Reward Amounts
    REFERRAL_FRIEND_DISCOUNT: parseInt(process.env.REFERRAL_FRIEND_DISCOUNT || "50"), // ₹50 off
    REFERRAL_REFERRER_COINS: parseInt(process.env.REFERRAL_REFERRER_COINS || "50"),   // 50 coins

    // Constraints
    REFERRAL_MIN_ORDER_VALUE: parseInt(process.env.REFERRAL_MIN_ORDER_VALUE || "499"), // Min cart value

    // Timing
    REFERRAL_RETURN_DAYS: parseInt(process.env.REFERRAL_RETURN_DAYS || "7"), // Wait 7 days after delivery
    REFERRAL_COIN_EXPIRY_DAYS: parseInt(process.env.REFERRAL_COIN_EXPIRY_DAYS || "60") // Expires in 60 days
};
