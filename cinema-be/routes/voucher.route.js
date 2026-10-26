const express = require("express");
const {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
  checkVoucher,
} = require("../controllers/voucher.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /vouchers - List active vouchers (Admins can pass ?all=true)
router.get("/", optionalVerifyToken, getAllVouchers);

// POST /vouchers/check - Check voucher discount (Public / User checkout)
router.post("/check", checkVoucher);

// GET /vouchers/:id - Get voucher by id
router.get("/:id", getVoucherById);

// Admin-only endpoints
router.post("/", verifyToken, adminOnly, createVoucher);
router.put("/:id", verifyToken, adminOnly, updateVoucher);
router.patch("/:id/toggle-status", verifyToken, adminOnly, toggleVoucherStatus);
router.delete("/:id", verifyToken, adminOnly, deleteVoucher);

module.exports = router;
