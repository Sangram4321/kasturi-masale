const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (amount, currency = "INR") => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency,
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw error;
    }
};

const verifySignature = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest("hex");

    return generatedSignature === signature;
};

const refundPayment = async (paymentId, amount) => {
    try {
        // Amount is optional for full refund
        const options = amount ? { amount: Math.round(amount * 100) } : {};
        const refund = await razorpay.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error("Razorpay Refund Error:", error);
        throw error;
    }
};

module.exports = {
    razorpay,
    createOrder,
    verifySignature,
    refundPayment
};

