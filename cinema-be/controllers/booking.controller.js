const db = require("../models");
const bookingUnavailableReason = require("../utils/bookingAvailability");

// Generate unique booking code e.g. NCC-839214
const generateBookingCode = () => {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);
  return `NCC-${timestampPart}${randomPart}`;
};

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

    // Find all confirmed bookings for this showtime
    const confirmedBookings = await db.Booking.find(
      { showtimeId, status: "confirmed" },
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

// POST /bookings – Create a new ticket booking with simulated mock payment
const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { showtimeId, seats, voucherCode, paymentMethod = "momo_mock" } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: "Vui lòng chọn suất chiếu và ít nhất một ghế ngồi",
      });
    }

    // Verify Showtime existence
    const showtime = await db.Showtime.findById(showtimeId)
      .populate("movieId")
      .populate("roomId");

    if (!showtime) {
      return res.status(404).json({ message: "Suất chiếu không tồn tại" });
    }

    const unavailable = bookingUnavailableReason(showtime);
    if (unavailable) return res.status(400).json({ message: unavailable });

    // Check race condition: Verify none of selected seats are already booked
    const existingBookings = await db.Booking.find(
      { showtimeId, status: "confirmed", seats: { $in: seats } },
      "seats"
    );

    if (existingBookings.length > 0) {
      const alreadyTaken = [];
      existingBookings.forEach((b) => {
        b.seats.forEach((s) => {
          if (seats.includes(s) && !alreadyTaken.includes(s)) {
            alreadyTaken.push(s);
          }
        });
      });

      return res.status(400).json({
        message: `Rất tiếc! Ghế [${alreadyTaken.join(", ")}] vừa được người khác đặt trước. Vui lòng chọn ghế khác.`,
      });
    }

    // Calculate seat prices: determine standard vs VIP seats
    const basePrice = showtime.price || 85000;
    const roomRows = showtime.roomId?.rows || 6;
    
    // Middle rows are VIP (e.g., C, D, E) with a surcharge of 15,000 VND
    const vipSurcharge = 15000;
    const seatDetails = [];
    let totalPrice = 0;

    seats.forEach((seat) => {
      const rowChar = seat.charAt(0).toUpperCase();
      const rowIndex = rowChar.charCodeAt(0) - 65; // A=0, B=1, C=2...
      
      // Determine if row is VIP (middle rows of the hall)
      const isVipRow = roomRows >= 4 && rowIndex >= 2 && rowIndex <= Math.min(roomRows - 2, 5);
      const seatType = isVipRow ? "vip" : "standard";
      const seatPrice = isVipRow ? basePrice + vipSurcharge : basePrice;

      seatDetails.push({
        seatNumber: seat,
        seatType,
        price: seatPrice,
      });

      totalPrice += seatPrice;
    });

    // Validate and apply Voucher discount if provided
    let discountAmount = 0;
    let appliedVoucherCode = "";

    if (voucherCode && voucherCode.trim()) {
      const cleanCode = voucherCode.trim().toUpperCase();
      const voucher = await db.Voucher.findOne({
        code: cleanCode,
        isActive: true,
        endDate: { $gte: new Date() },
      });

      if (voucher) {
        if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
          return res.status(400).json({ message: "Mã voucher này đã hết lượt sử dụng" });
        }

        if (totalPrice < (voucher.minOrderValue || 0)) {
          return res.status(400).json({
            message: `Đơn hàng tối thiểu để dùng voucher này là ${voucher.minOrderValue.toLocaleString("vi-VN")} đ`,
          });
        }

        if (voucher.discountType === "percentage") {
          discountAmount = (totalPrice * voucher.discountValue) / 100;
          if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
            discountAmount = voucher.maxDiscount;
          }
        } else {
          discountAmount = voucher.discountValue;
        }

        // Cap discount so finalPrice cannot be less than 0
        discountAmount = Math.min(discountAmount, totalPrice);
        appliedVoucherCode = cleanCode;

        // Increment voucher used count
        voucher.usedCount = (voucher.usedCount || 0) + 1;
        await voucher.save();
      } else {
        return res.status(400).json({
          message: "Mã voucher không hợp lệ hoặc đã hết hạn",
        });
      }
    }

    const finalPrice = Math.max(0, totalPrice - discountAmount);
    const bookingCode = generateBookingCode();

    // Create booking record with simulated mock payment successful
    const newBooking = new db.Booking({
      userId,
      showtimeId,
      seats,
      seatDetails,
      totalPrice,
      voucherCode: appliedVoucherCode,
      discountAmount,
      finalPrice,
      bookingCode,
      paymentMethod,
      paymentStatus: "paid", // Mock payment instant approval
      status: "confirmed",
      bookingDate: new Date(),
    });

    const savedBooking = await newBooking.save();

    const populatedBooking = await db.Booking.findById(savedBooking._id)
      .populate("userId", "name email phone")
      .populate({
        path: "showtimeId",
        populate: [
          { path: "movieId", select: "title titleEn poster rating duration" },
          { path: "roomId", select: "name roomType" },
        ],
      });

    return res.status(201).json({
      message: "Đặt vé và thanh toán thành công!",
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /bookings/my-tickets – Get user's booked tickets
const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

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
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /bookings/:id/cancel – Cancel a booking (User or Admin)
const cancelBooking = async (req, res) => {
  try {
    const booking = await db.Booking.findById(req.params.id).populate("showtimeId");

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy vé cần huỷ" });
    }

    if (booking.userId.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền huỷ vé này" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Vé này đã được huỷ trước đó" });
    }

    // Check if showtime start time is at least 60 minutes away
    if (booking.showtimeId?.startTime) {
      const showtimeStart = new Date(booking.showtimeId.startTime).getTime();
      const now = Date.now();
      if (showtimeStart - now < 60 * 60 * 1000) {
        return res.status(400).json({
          message: "Không thể huỷ vé trước giờ chiếu dưới 60 phút theo quy định của rạp",
        });
      }
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Revert voucher usage count if applicable
    if (booking.voucherCode) {
      await db.Voucher.findOneAndUpdate(
        { code: booking.voucherCode, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
    }

    return res.status(200).json({
      message: "Huỷ vé thành công! Tiền sẽ được hoàn lại theo phương thức đã chọn.",
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
