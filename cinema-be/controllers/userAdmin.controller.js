const db = require("../models");

// GET /admin/users – Lấy danh sách toàn bộ tài khoản (hỗ trợ search, filter)
const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role && ["user", "admin"].includes(role)) {
      query.role = role;
    }

    // Filter by status (active / inactive)
    if (status === "active") {
      query.isActive = { $ne: false };
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const users = await db.User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      total: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /admin/users/:id – Xem chi tiết 1 người dùng
const getUserById = async (req, res) => {
  try {
    const user = await db.User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /admin/users/:id – Cập nhật thông tin và phân quyền (role)
const updateUser = async (req, res) => {
  try {
    const { name, phone, address, role } = req.body;

    const user = await db.User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    if (role && ["user", "admin"].includes(role)) {
      // Bảo vệ: Admin không thể tự hạ quyền của chính mình nếu là admin duy nhất
      if (req.userId.toString() === user._id.toString() && role !== "admin") {
        return res.status(400).json({
          message: "Không thể tự hạ quyền Admin của chính tài khoản đang đăng nhập!",
        });
      }
      user.role = role;
    }

    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      message: "Cập nhật người dùng thành công",
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

// PATCH /admin/users/:id/toggle-status – Khóa / Mở khóa tài khoản (Soft Delete)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await db.User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Bảo vệ: Không cho phép Admin tự khóa chính mình
    if (req.userId.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "Không thể tự khóa tài khoản của chính mình!",
      });
    }

    // Đảo trạng thái active/inactive
    const newStatus = user.isActive === false ? true : false;
    user.isActive = newStatus;
    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      message: newStatus
        ? "Mở khóa tài khoản thành công"
        : "Khóa tài khoản thành công (Inactive)",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
};
