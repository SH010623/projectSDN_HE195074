const db = require("../models");

// GET /vouchers - List vouchers
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
      message: "Vouchers fetched successfully",
      total: vouchers.length,
      vouchers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /vouchers/:id - Get single voucher
const getVoucherById = async (req, res) => {
  try {
    const voucher = await db.Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    return res.status(200).json({
      message: "Voucher details fetched successfully",
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /vouchers - Create voucher (Admin only)
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
        message: "Code, title, discount value, and expiration date are required",
      });
    }

    const upperCode = code.trim().toUpperCase();
    const existing = await db.Voucher.findOne({ code: upperCode });
    if (existing) {
      return res.status(409).json({ message: "Voucher code already exists" });
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
      message: "Voucher created successfully",
      voucher: newVoucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /vouchers/:id - Update voucher (Admin only)
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
      return res.status(404).json({ message: "Voucher not found" });
    }

    if (code) {
      const upperCode = code.trim().toUpperCase();
      if (upperCode !== voucher.code) {
        const existing = await db.Voucher.findOne({ code: upperCode });
        if (existing) {
          return res.status(409).json({ message: "Voucher code already exists" });
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
      message: "Voucher updated successfully",
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /vouchers/:id/toggle-status - Toggle active status (Admin only)
const toggleVoucherStatus = async (req, res) => {
  try {
    const voucher = await db.Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();

    return res.status(200).json({
      message: `Voucher is now ${voucher.isActive ? "Active" : "Inactive"}`,
      voucher,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /vouchers/:id - Delete voucher (Admin only)
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await db.Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    return res.status(200).json({
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /vouchers/check - Check voucher applicability for booking/checkout
const checkVoucher = async (req, res) => {
  try {
    const { code, orderTotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Voucher code is required" });
    }

    const voucher = await db.Voucher.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({ message: "Invalid or inactive voucher code" });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: "Voucher is expired or not yet active" });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Voucher usage limit has been reached" });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value for this voucher is ${voucher.minOrderValue.toLocaleString()} VND`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    // Discount cannot exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    const finalTotal = Math.max(0, orderTotal - discountAmount);

    return res.status(200).json({
      message: "Voucher applied successfully",
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
