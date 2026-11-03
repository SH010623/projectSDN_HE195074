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

const crypto = require("node:crypto");
const { sendPasswordResetOtp } = require("../utils/passwordResetMail");
const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_MS = 60 * 1000;
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const otpHash = (email, otp) => crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${email}:${otp}`).digest("hex");

// Sending again replaces the previous code. The database claim prevents concurrent sends.
const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Vui lòng nhập email hợp lệ" });
  }
  try {
    const now = new Date();
    const otp = String(crypto.randomInt(100000, 1000000));
    const hash = otpHash(email, otp);
    const user = await db.User.findOneAndUpdate({
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      isActive: { $ne: false },
      $or: [{ resetOtpSentAt: { $exists: false } }, { resetOtpSentAt: { $lte: new Date(now.getTime() - RESEND_MS) } }],
    }, { $set: { resetOtpHash: hash, resetOtpExpiresAt: new Date(now.getTime() + OTP_TTL_MS), resetOtpSentAt: now, resetOtpAttempts: 0 } }, { new: true });
    if (user) {
      try {
        await sendPasswordResetOtp(user.email, otp);
      } catch (error) {
        await db.User.updateOne({ _id: user._id, resetOtpHash: hash }, { $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1, resetOtpSentAt: 1 }, $set: { resetOtpAttempts: 0 } });
        return res.status(503).json({ message: "Không thể gửi email. Vui lòng thử lại sau." });
      }
    }
    return res.json({ message: "Nếu email đã đăng ký và tài khoản đang hoạt động, mã OTP sẽ được gửi. Vui lòng kiểm tra cả thư rác và chờ 60 giây trước khi gửi lại.", retryAfter: 60, expiresIn: 300 });
  } catch (error) {
    return res.status(500).json({ message: "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." });
  }
};

const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, newPassword } = req.body;
  if (!email || typeof otp !== "string" || !/^\d{6}$/.test(otp) || typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 128) {
    return res.status(400).json({ message: "Vui lòng nhập email, OTP 6 số và mật khẩu mới từ 6 đến 128 ký tự" });
  }
  try {
    // Every attempt is counted atomically, including concurrent requests.
    const user = await db.User.findOneAndUpdate({
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      isActive: { $ne: false }, resetOtpExpiresAt: { $gt: new Date() }, resetOtpAttempts: { $lt: 5 },
    }, { $inc: { resetOtpAttempts: 1 } }, { new: true }).select("+resetOtpHash");
    const hash = otpHash(email, otp);
    if (!user || user.resetOtpHash !== hash) {
      return res.status(400).json({ message: "OTP không hợp lệ, đã hết hạn hoặc đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới." });
    }
    const password = await bcryptjs.hash(newPassword, 10);
    const result = await db.User.updateOne({ _id: user._id, isActive: { $ne: false }, resetOtpHash: hash, resetOtpExpiresAt: { $gt: new Date() } }, {
      $set: { password, updatedAt: new Date() },
      $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1, resetOtpAttempts: 1 },
    });
    if (!result.modifiedCount) return res.status(400).json({ message: "OTP đã được sử dụng hoặc hết hạn. Vui lòng yêu cầu mã mới." });
    return res.json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới." });
  } catch (error) {
    return res.status(500).json({ message: "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau." });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
