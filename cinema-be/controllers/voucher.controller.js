const db = require("../models");

// GET /vouchers - Danh sách voucher
const getAllVouchers = async (req, res) => {
  try {
    const { all, search } = req.query;
    const query = {};

    const isAdmin = req.role === "admin";
    if (!isAdmin || all !== "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { code: { $regex: search.trim().toUpperCase(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const vouchers = await db.Voucher.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách voucher thành công",
      total: vouchers.length,
      vouchers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /vouchers/:id - Xem chi tiết voucher
const getVoucherById = async (req, res) => {
  try {
    const voucher = await db.Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết voucher thành công",
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /vouchers - Tạo voucher mới (Chỉ Admin)
const createVoucher = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
    } = req.body;

    if (!code || !title || !discountValue || !endDate) {
      return res.status(400).json({
        message: "Vui lòng nhập đủ: Mã code, tiêu đề, mức giảm giá và ngày hết hạn",
      });
    }

    const upperCode = code.trim().toUpperCase();
    const existing = await db.Voucher.findOne({ code: upperCode });
    if (existing) {
      return res.status(409).json({ message: "Mã voucher này đã tồn tại" });
    }

    const newVoucher = new db.Voucher({
      code: upperCode,
      title: title.trim(),
      description: description ? description.trim() : "",
      discountType: discountType || "fixed",
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      isActive: true,
    });

    await newVoucher.save();

    return res.status(201).json({
      message: "Tạo voucher mới thành công",
      voucher: newVoucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /vouchers/:id - Cập nhật voucher (Chỉ Admin)
const updateVoucher = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    const voucher = await db.Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    if (code) {
      const upperCode = code.trim().toUpperCase();
      if (upperCode !== voucher.code) {
        const existing = await db.Voucher.findOne({ code: upperCode });
        if (existing) {
          return res.status(409).json({ message: "Mã voucher này đã tồn tại" });
        }
        voucher.code = upperCode;
      }
    }

    if (title) voucher.title = title.trim();
    if (description !== undefined) voucher.description = description.trim();
    if (discountType) voucher.discountType = discountType;
    if (discountValue !== undefined) voucher.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) voucher.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) voucher.maxDiscount = Number(maxDiscount);
    if (startDate) voucher.startDate = new Date(startDate);
    if (endDate) voucher.endDate = new Date(endDate);
    if (usageLimit !== undefined) voucher.usageLimit = Number(usageLimit);
    if (isActive !== undefined) voucher.isActive = Boolean(isActive);

    await voucher.save();

    return res.status(200).json({
      message: "Cập nhật voucher thành công",
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /vouchers/:id/toggle-status - Bật / Tắt voucher (Chỉ Admin)
const toggleVoucherStatus = async (req, res) => {
  try {
    const voucher = await db.Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();

    return res.status(200).json({
      message: `Voucher hiện đang ở trạng thái: ${voucher.isActive ? "Kích hoạt" : "Đã tắt"}`,
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /vouchers/:id - Xóa voucher (Chỉ Admin)
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await db.Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    return res.status(200).json({
      message: "Xóa voucher thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /vouchers/check - Kiểm tra áp dụng mã voucher cho đơn đặt vé
const checkVoucher = async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Vui lòng nhập mã voucher" });
    }

    const voucher = await db.Voucher.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({ message: "Mã voucher không tồn tại hoặc đã bị khóa" });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: "Mã voucher đã hết hạn sử dụng" });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Mã voucher đã hết lượt sử dụng" });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu để áp dụng mã này là ${voucher.minOrderValue.toLocaleString()} VNĐ`,
      });
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    const finalTotal = Math.max(0, orderTotal - discountAmount);

    return res.status(200).json({
      message: "Áp dụng mã giảm giá thành công",
      voucher: {
        code: voucher.code,
        title: voucher.title,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
      discountAmount,
      finalTotal,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
  checkVoucher,
};
