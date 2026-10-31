const db = require("../models");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

// POST /register
// Body: { email, password, name, phone }
const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ email, mật khẩu, họ tên và số điện thoại",
      });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email này đã được đăng ký" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const newUser = new db.User({
      email,
      password: hashedPassword,
      name,
      phone,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." });
  }
};

// POST /login
// Body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    // Find user by email
    const user = await db.User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive !== false,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." });
  }
};

// POST /forgot-password
// Body: { email, phone, newPassword }
const forgotPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ Email, Số điện thoại và Mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Find user matching both email and phone
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const user = await db.User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
      phone: cleanPhone,
    });

    if (!user) {
      return res.status(404).json({
        message: "Thông tin xác minh không chính xác. Không tìm thấy tài khoản phù hợp với Email và Số điện thoại này.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Hash new password and save
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." });
  }
};

module.exports = { register, login, forgotPassword };
