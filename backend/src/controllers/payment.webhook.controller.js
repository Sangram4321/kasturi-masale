const webhookService = require("../services/webhook.service");

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        // Razorpay sends the JSON body
        await webhookService.handleRazorpayWebhook(req.body, signature);
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Razorpay Webhook Error:", err.message);
        // Return 200 even on error to stop Razorpay from retrying indefinitely if it's a logic error?
        // Usually 400 is better for signature mismatch.
        res.status(400).json({ error: err.message });
    }
};
