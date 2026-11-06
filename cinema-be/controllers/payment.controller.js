const mongoose = require("mongoose");
const db = require("../models");
const { getConfig, validAuthorization, extractBookingCode } = require("../utils/sepay");
const { releaseVoucher, sendConfirmation } = require("../utils/bookingPayment");

const sepayWebhook = async (req, res) => {
  let config;
  try { config = getConfig(); }
  catch { return res.status(503).json({ success: false, message: "SePay is not configured" }); }
  if (!validAuthorization(req.get("authorization"), config.apiKey)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const payload = req.body;
  if (!payload || !Number.isSafeInteger(payload.id) || payload.id < 0
    || !Number.isSafeInteger(payload.transferAmount) || payload.transferAmount <= 0
    || typeof payload.accountNumber !== "string" || typeof payload.transferType !== "string"
    || (payload.content != null && typeof payload.content !== "string")) {
    return res.status(400).json({ success: false, message: "Invalid transaction payload" });
  }
  // The dashboard connectivity test uses id=0. Acknowledge it after authentication
  // and validation, but never let it create a payment or confirm a real ticket.
  if (payload.id === 0) {
    return res.json({ success: true, message: "Test webhook received; no payment processed" });
  }
  if (payload.transferType !== "in" || payload.accountNumber !== config.accountNumber) {
    return res.json({ success: true, message: "Ignored transaction outside configured receiving account" });
  }
  const transactionId = String(payload.id);
  let confirmedId;
  try {
    // Fast path for retries; the unique DB index also protects concurrent deliveries.
    if (await db.PaymentTransaction.exists({ transactionId })) return res.json({ success: true });
    await mongoose.connection.transaction(async (session) => {
      confirmedId = undefined;
      const code = extractBookingCode(payload);
      const booking = code ? await db.Booking.findOne({ bookingCode: code, paymentMethod: "sepay" }).session(session) : null;
      const record = { transactionId, bookingId: booking?._id, bookingCode: code,
        amount: payload.transferAmount, content: payload.content || "", referenceCode: payload.referenceCode || "",
        outcome: "unmatched", reason: "Không tìm thấy mã đơn duy nhất trong nội dung chuyển khoản" };
      if (booking) {
        const now = new Date();
        const showtime = await db.Showtime.findById(booking.showtimeId).populate("movieId").populate("roomId").session(session);
        const unavailable = !showtime || require("../utils/bookingAvailability")(showtime);
        if (booking.status === "pending" && booking.paymentStatus === "pending"
          && booking.seatLock && booking.expiresAt > now && !unavailable
          && booking.finalPrice === payload.transferAmount) {
          booking.status = "confirmed";
          booking.paymentStatus = "paid";
          booking.paidAt = now;
          booking.sepayTransactionId = transactionId;
          booking.confirmationEmailStatus = "pending";
          await booking.save({ session });
          record.outcome = "confirmed";
          record.reason = "Đã xác nhận vé";
          confirmedId = booking._id;
        } else {
          record.outcome = "review";
          record.reason = booking.paymentStatus === "paid" ? "Đơn đã thanh toán; giao dịch bổ sung cần đối soát"
            : booking.finalPrice !== payload.transferAmount ? "Số tiền không khớp; cần đối soát/hoàn tiền thủ công"
            : "Đơn hết hạn, đã huỷ hoặc suất chiếu không còn hợp lệ; cần đối soát/hoàn tiền thủ công";
          if (booking.paymentStatus !== "paid" && booking.paymentStatus !== "refunded") {
            await releaseVoucher(booking, session);
            booking.voucherReserved = false;
            booking.seatLock = false;
            if (booking.status === "pending") booking.status = "expired";
            booking.paymentStatus = "review";
            await booking.save({ session });
          }
        }
      }
      await db.PaymentTransaction.create([record], { session });
    });
    // Acknowledge before SMTP; persisted email state is retried by the background job.
    res.json({ success: true });
    if (confirmedId) void sendConfirmation(confirmedId).catch(() => {});
  } catch (error) {
    if (error.code === 11000 && await db.PaymentTransaction.exists({ transactionId })) {
      return res.json({ success: true });
    }
    console.error("SePay webhook failed", { transactionId, code: error.code || "WEBHOOK_ERROR" });
    return res.status(500).json({ success: false, message: "Please retry webhook delivery" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const filter = req.query.outcome === "review" ? { outcome: "review" }
      : req.query.outcome === "unmatched" ? { outcome: "unmatched" } : {};
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const transactions = await db.PaymentTransaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50);
    return res.json({ transactions, total: await db.PaymentTransaction.countDocuments(filter), page });
  } catch { return res.status(500).json({ message: "Không thể tải giao dịch." }); }
};

module.exports = { sepayWebhook, getTransactions };
