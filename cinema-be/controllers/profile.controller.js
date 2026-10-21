const db = require("../models");
const bcryptjs = require("bcryptjs");

// GET /profile – Lấy thông tin tài khoản hiện tại
const getProfile = async (req, res) => {
  try {
    const user = await db.User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin cá nhân thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /profile – Cập nhật thông tin cá nhân (name, phone, address)
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await db.User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Không thể thực hiện cập nhật.",
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /profile/change-password – Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await db.User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
