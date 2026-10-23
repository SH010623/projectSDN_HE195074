const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profile.controller");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

// Tất cả route profile đều yêu cầu đăng nhập
router.use(verifyToken);

// GET /profile – Lấy thông tin cá nhân
router.get("/", getProfile);

// PUT /profile – Cập nhật thông tin cá nhân
router.put("/", updateProfile);

// PUT /profile/change-password – Đổi mật khẩu
router.put("/change-password", changePassword);

module.exports = router;
