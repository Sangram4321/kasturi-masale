const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batch.controller");

/* ================= IMPORTANT =================
   /stats MUST be ABOVE /:batchId
   Otherwise "stats" is treated as batchId
============================================== */

// ✅ DASHBOARD INVENTORY STATS (CRITICAL)
router.get("/stats", batchController.getInventoryStats);

// ================= BATCH CRUD =================
router.post("/", batchController.createBatch);
router.get("/", batchController.getAllBatches);

// ================= STOCK MOVEMENTS =================
router.post("/:batchId/out", batchController.manualStockOut);
router.post("/:batchId/in", batchController.manualStockIn);

// ================= UPDATE & DELETE =================
router.put("/:batchId", batchController.updateBatch);
router.delete("/:batchId", batchController.deleteBatch);
router.patch("/:batchId/history/:entryId/void", batchController.voidHistoryEntry);

module.exports = router;
