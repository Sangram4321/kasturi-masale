const express = require("express");
const controller = require("../controllers/auth.controller");
const { protectAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", controller.login);
router.get("/logout", controller.logout);
router.post("/create-seed", controller.createAdmin); // RESTRICTED

// Protected Routes
router.use(protectAdmin);
router.post("/2fa/setup", controller.setup2FA);
router.post("/2fa/verify", controller.verify2FA);
router.post("/change-password", controller.changePassword);
router.post("/rotate-password", controller.rotatePassword);

module.exports = router;
