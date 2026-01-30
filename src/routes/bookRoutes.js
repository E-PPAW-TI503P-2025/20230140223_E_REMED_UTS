const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/roleMiddleware");
const bookController = require("../controllers/bookController");

// Public
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);

// Admin
router.post("/", requireAdmin, bookController.createBook);
router.put("/:id", requireAdmin, bookController.updateBook);
router.delete("/:id", requireAdmin, bookController.deleteBook);

module.exports = router;

