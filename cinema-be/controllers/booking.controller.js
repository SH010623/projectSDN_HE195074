const db = require("../models");
const bookingUnavailableReason = require("../utils/bookingAvailability");

const mongoose = require("mongoose");
const crypto = require("node:crypto");
const { getConfig, paymentDetails } = require("../utils/sepay");
const { populateBooking, expireBookings, releaseVoucher, sendConfirmation } = require("../utils/bookingPayment");
const fail = (status, message) => { const error = new Error(message); error.status = status; throw error; };
const paymentError = (error, res) => res.status(error.code === 11000 ? 409 : error.status || 500).json({
  message: error.code === 11000 ? "Ghế vừa được đặt hoặc đang chờ thanh toán. Vui lòng chọn ghế khác."
    : error.code === 20 ? "Thanh toán cần MongoDB Atlas hoặc MongoDB replica set."
    : error.status ? error.message : "Không thể xử lý đặt vé lúc này. Vui lòng thử lại.",
});

// GET /bookings/showtime/:showtimeId/seats – Get seat layout and occupied seats for a showtime
const getOccupiedSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const showtime = await db.Showtime.findById(showtimeId)
      .populate("movieId", "title titleEn duration poster rating genres status")
      .populate("roomId", "name roomType totalSeats rows seatsPerRow status");

    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    const unavailable = bookingUnavailableReason(showtime);
    if (unavailable) return res.status(400).json({ message: unavailable });

    await expireBookings({ showtimeId });

    // Include active holds as well as paid seats.
    const confirmedBookings = await db.Booking.find(
      { showtimeId, $or: [{ status: "confirmed" }, { status: "pending", expiresAt: { $gt: new Date() } }] },
      "seats"
    );

    // Flatten all booked seats into a single array
    const occupiedSeats = [];
    confirmedBookings.forEach((b) => {
      if (Array.isArray(b.seats)) {
        occupiedSeats.push(...b.seats);
      }
    });

    return res.status(200).json({
      message: "Lấy thông tin ghế thành công",
      showtime,
      occupiedSeats,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /bookings — create a server-priced order and reserve seats for five minutes.
const createBooking = async (req, res) => {
  try {
    getConfig();
    const { showtimeId, seats, voucherCode, paymentMethod = "sepay" } = req.body;
    if (!mongoose.isValidObjectId(showtimeId) || !Array.isArray(seats) || !seats.length || seats.length > 8
      || seats.some(seat => typeof seat !== "string" || !/^[A-Z][1-9]\d*$/.test(seat))
      || new Set(seats).size !== seats.length || (voucherCode != null && typeof voucherCode !== "string")) {
      return res.status(400).json({ message: "Vui lòng chọn suất chiếu và từ 1 đến 8 ghế hợp lệ, không trùng nhau." });
    }
    if (paymentMethod !== "sepay") return res.status(400).json({ message: "Vui lòng thanh toán bằng chuyển khoản SePay." });
    await expireBookings({ showtimeId });
    let bookingId;
    await mongoose.connection.transaction(async (session) => {
      const showtime = await db.Showtime.findById(showtimeId).populate("movieId").populate("roomId").session(session);
      if (!showtime) fail(404, "Suất chiếu không tồn tại");
      const unavailable = bookingUnavailableReason(showtime);
      if (unavailable) fail(400, unavailable);
      const room = showtime.roomId;
      if (seats.some(seat => seat.charCodeAt(0) - 65 >= room.rows || Number(seat.slice(1)) > room.seatsPerRow)) {
        fail(400, "Ghế không tồn tại trong phòng chiếu.");
      }
      // Also protects seats sold before the active-seat index was introduced.
      const taken = await db.Booking.exists({ showtimeId, seats: { $in: seats },
        $or: [{ status: "confirmed" }, { status: "pending", expiresAt: { $gt: new Date() } }],
      }).session(session);
      if (taken) fail(409, "Ghế đã bán hoặc đang được giữ chỗ. Vui lòng chọn ghế khác.");
      const seatDetails = seats.map(seat => {
        const row = seat.charCodeAt(0) - 65;
        const vip = room.rows >= 4 && row >= 2 && row <= Math.min(room.rows - 2, 5);
        return { seatNumber: seat, seatType: vip ? "vip" : "standard", price: showtime.price + (vip ? 15000 : 0) };
      });
      const totalPrice = seatDetails.reduce((sum, seat) => sum + seat.price, 0);
      let discountAmount = 0;
      let appliedVoucherCode = "";
      if (voucherCode?.trim()) {
        const voucher = await db.Voucher.findOneAndUpdate({ code: voucherCode.trim().toUpperCase(), isActive: true,
          startDate: { $lte: new Date() }, endDate: { $gte: new Date() }, minOrderValue: { $lte: totalPrice },
          $expr: { $or: [{ $lte: ["$usageLimit", 0] }, { $lt: ["$usedCount", "$usageLimit"] }] },
        }, { $inc: { usedCount: 1 } }, { new: true, session });
        if (!voucher) fail(400, "Voucher không hợp lệ, hết lượt hoặc đơn chưa đạt giá trị tối thiểu.");
        discountAmount = voucher.discountType === "percentage" ? Math.floor(totalPrice * voucher.discountValue / 100) : voucher.discountValue;
        if (voucher.discountType === "percentage" && voucher.maxDiscount > 0) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
        discountAmount = Math.min(discountAmount, totalPrice);
        appliedVoucherCode = voucher.code;
      }
      const finalPrice = totalPrice - discountAmount;
      const expiresAt = new Date(Math.min(Date.now() + 5 * 60 * 1000, new Date(showtime.startTime).getTime()));
      const [booking] = await db.Booking.create([{
        userId: req.userId, showtimeId, seats, seatDetails, totalPrice, discountAmount, finalPrice,
        voucherCode: appliedVoucherCode, voucherReserved: Boolean(appliedVoucherCode),
        bookingCode: `NCC${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
        paymentMethod: "sepay", seatLock: true, expiresAt,
        status: finalPrice === 0 ? "confirmed" : "pending",
        paymentStatus: finalPrice === 0 ? "paid" : "pending",
        ...(finalPrice === 0 ? { paidAt: new Date(), confirmationEmailStatus: "pending" } : {}),
      }], { session });
      bookingId = booking._id;
    });
    const booking = await populateBooking(db.Booking.findById(bookingId));
    if (booking.status === "confirmed") void sendConfirmation(bookingId).catch(() => {});
    return res.status(201).json({ message: booking.status === "confirmed" ? "Đặt vé thành công!" : "Đã giữ ghế. Vui lòng chuyển khoản trong thời hạn hiển thị.",
      booking, payment: paymentDetails(booking) });
  } catch (error) { return paymentError(error, res); }
};

// GET /bookings/my-tickets – Get user's booked tickets
const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    await expireBookings({ userId });
    const bookings = await db.Booking.find({ userId })
      .populate({
        path: "showtimeId",
        populate: [
          { path: "movieId", select: "title titleEn poster rating duration genres" },
          { path: "roomId", select: "name roomType" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách vé thành công",
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /bookings/:id – Get details of a single booking
const getBookingById = async (req, res) => {
  try {
    await expireBookings({ _id: req.params.id, ...(req.role === "admin" ? {} : { userId: req.userId }) });
    const booking = await db.Booking.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate({
        path: "showtimeId",
        populate: [
          { path: "movieId" },
          { path: "roomId" },
        ],
      });

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy vé xem phim" });
    }

    // Verify ownership or admin privilege
    if (booking.userId._id.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền xem vé này" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết vé thành công",
      booking,
      payment: paymentDetails(booking),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Pending orders can be cancelled. Real transfers need a separate, manual refund process.
const cancelBooking = async (req, res) => {
  try {
    await mongoose.connection.transaction(async (session) => {
      const booking = await db.Booking.findById(req.params.id).populate("showtimeId").session(session);
      if (!booking) fail(404, "Không tìm thấy vé cần huỷ");
      if (String(booking.userId) !== req.userId && req.role !== "admin") fail(403, "Bạn không có quyền huỷ vé này");
      if (["cancelled", "expired"].includes(booking.status)) fail(400, "Đơn đã huỷ hoặc hết hạn.");
      if (booking.paymentMethod === "sepay" && booking.paymentStatus !== "pending") {
        fail(400, "Giao dịch đã nhận tiền hoặc cần đối soát. Vui lòng liên hệ rạp để xử lý huỷ/hoàn tiền.");
      }
      if (booking.status === "confirmed" && new Date(booking.showtimeId.startTime).getTime() - Date.now() < 60 * 60 * 1000) {
        fail(400, "Không thể huỷ vé trước giờ chiếu dưới 60 phút.");
      }
      // Legacy mock tickets predate voucherReserved.
      if (booking.paymentMethod !== "sepay") booking.voucherReserved = Boolean(booking.voucherCode);
      await releaseVoucher(booking, session);
      booking.voucherReserved = false;
      booking.status = "cancelled";
      booking.seatLock = false;
      if (booking.paymentStatus === "paid") booking.paymentStatus = "refunded";
      await booking.save({ session });
    });
    return res.json({ message: "Đã huỷ đơn và giải phóng ghế.", booking: await db.Booking.findById(req.params.id) });
  } catch (error) { return paymentError(error, res); }
};

// GET /bookings/admin/all – Admin get all bookings with search and filters
const getAllBookings = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.bookingCode = new RegExp(search.trim(), "i");
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      db.Booking.find(query)
        .populate("userId", "name email phone")
        .populate({
          path: "showtimeId",
          populate: [{ path: "movieId", select: "title" }, { path: "roomId", select: "name" }],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      db.Booking.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách tất cả đơn đặt vé thành công",
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOccupiedSeats,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
