const express = require("express");
const router = express.Router();

const { requireAdmin, requireUser } = require("../middleware/roleMiddleware");
const { borrowBook, getBorrowLogs } = require("../controllers/borrowController");

// Admin (opsional)
router.get("/logs", requireAdmin, getBorrowLogs);

router.post("/", requireUser, borrowBook);

module.exports = router;

