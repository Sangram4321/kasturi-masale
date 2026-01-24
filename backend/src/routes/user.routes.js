const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const otpController = require("../controllers/otp.controller");

router.post("/sync", userController.syncUser);
router.get("/wallet/:uid", userController.getWallet);
router.get("/orders/:uid", userController.getUserOrders);

// OTP Routes
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);

module.exports = router;
