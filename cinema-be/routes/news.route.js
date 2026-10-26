const express = require("express");
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  toggleNewsStatus,
  deleteNews,
} = require("../controllers/news.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /news - Get news list (Optional token for admin to see hidden ones)
router.get("/", optionalVerifyToken, getAllNews);

// GET /news/:id - Read single article
router.get("/:id", getNewsById);

// Admin-only endpoints
router.post("/", verifyToken, adminOnly, createNews);
router.put("/:id", verifyToken, adminOnly, updateNews);
router.patch("/:id/toggle-status", verifyToken, adminOnly, toggleNewsStatus);
router.delete("/:id", verifyToken, adminOnly, deleteNews);

module.exports = router;
