const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const otpController = require("../controllers/otp.controller");

const { protectUser } = require("../middleware/auth.middleware");

router.post("/sync", userController.syncUser);
router.post("/validate-referral", userController.validateReferral);
router.get("/wallet/me", protectUser, userController.getMyWallet); // Secure Route
router.get("/wallet/:uid", userController.getWallet); // Legacy insecure route
router.get("/orders/:uid", userController.getUserOrders);

// OTP Routes
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);

module.exports = router;
