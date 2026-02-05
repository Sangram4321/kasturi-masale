const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.wallet.controller");
const { protectAdmin } = require("../middleware/auth.middleware");

// All routes protected by Admin Auth
router.use(protectAdmin);

router.get("/users/search", controller.searchUsers);
router.get("/users/:userId", controller.getUserWallet);
router.post("/adjust", controller.adjustWallet);
router.post("/resolve-pending", controller.resolvePending);

module.exports = router;
