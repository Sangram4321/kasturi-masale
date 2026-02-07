const webhookService = require("../services/webhook.service");

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        // req.body is a Buffer due to express.raw() in app.js
        await webhookService.handleRazorpayWebhook(req.body, signature);

        // Return 200 immediately after successful validation/processing
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Razorpay Webhook Error:", err.message);
        res.status(400).json({ error: err.message });
    }
};
