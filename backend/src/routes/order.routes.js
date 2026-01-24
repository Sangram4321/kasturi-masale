const express = require("express");
const controller = require("../controllers/order.controller");
const ithinkWebhookController = require("../controllers/ithink.webhook.controller");
const { protectAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// WEBHOOKS (Public)
router.post("/webhook/ithink", ithinkWebhookController.handleWebhook);
router.get("/webhook/ithink", ithinkWebhookController.handleWebhook);

/* ================= CUSTOMER ================= */
router.post("/create", controller.createOrder);
router.post("/create-payment", controller.createPaymentOrder);
router.post("/verify-payment", controller.verifyPaymentAndCreateOrder);
router.post("/user/:orderId/cancel", controller.cancelOrderByUser);

/* ================= ADMIN (PROTECTED) ================= */
// Apply Middleware to all routes below
router.use("/admin", protectAdmin);

router.get("/admin/stats", controller.getDashboardStats);
router.get("/admin/all", controller.getAllOrders);
router.get("/admin/:orderId", controller.getOrderById);
router.put("/admin/:orderId/status", controller.updateOrderStatus);
router.post("/admin/:orderId/ship", controller.createShipment);
router.post("/admin/:orderId/cancel", controller.cancelOrder);
router.post("/admin/:orderId/rto", controller.initiateRTO);

module.exports = router;
