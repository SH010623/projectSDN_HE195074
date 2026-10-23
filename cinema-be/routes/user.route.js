const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
} = require("../controllers/userAdmin.controller");
const { verifyToken, adminOnly } = require("../middlewares/verifyToken");

const router = express.Router();

// Tất cả route quản lý tài khoản đều yêu cầu token và quyền admin
router.use(verifyToken, adminOnly);

// GET /admin/users – Danh sách tài khoản
router.get("/", getAllUsers);

// GET /admin/users/:id – Xem chi tiết tài khoản
router.get("/:id", getUserById);

// PUT /admin/users/:id – Cập nhật thông tin & đổi role
router.put("/:id", updateUser);

// PATCH /admin/users/:id/toggle-status – Khóa / Mở khóa tài khoản (Soft Delete)
router.patch("/:id/toggle-status", toggleUserStatus);

module.exports = router;
