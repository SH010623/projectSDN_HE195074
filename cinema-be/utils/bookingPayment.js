const mongoose = require("mongoose");
const db = require("../models");
const { sendBookingConfirmation } = require("./bookingMail");

const populateBooking = (query) => query
  .populate("userId", "name email phone")
  .populate({ path: "showtimeId", populate: [
    { path: "movieId", select: "title titleEn poster rating duration" },
    { path: "roomId", select: "name roomType" },
  ] });

async function releaseVoucher(booking, session) {
  if (booking.voucherReserved && booking.voucherCode) {
    await db.Voucher.updateOne({ code: booking.voucherCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }, { session });
  }
}

// Updating the booking and returning the reserved voucher happen in one transaction.
async function expireBookings(filter = {}) {
  const expired = await db.Booking.find({ ...filter, status: "pending", expiresAt: { $lte: new Date() } }).select("_id").limit(100);
  for (const item of expired) {
    await mongoose.connection.transaction(async (session) => {
      const booking = await db.Booking.findOneAndUpdate({ _id: item._id, status: "pending", expiresAt: { $lte: new Date() } },
        { $set: { status: "expired", seatLock: false, voucherReserved: false } }, { session });
      if (booking) await releaseVoucher(booking, session);
    });
  }
}

async function sendConfirmation(bookingId) {
  const now = new Date();
  const claimed = await db.Booking.findOneAndUpdate({
    _id: bookingId, status: "confirmed", paymentStatus: "paid",
    confirmationEmailStatus: { $in: ["pending", "sending"] },
    $or: [{ confirmationEmailRetryAt: { $exists: false } }, { confirmationEmailRetryAt: { $lte: now } }],
  }, { $set: { confirmationEmailStatus: "sending", confirmationEmailRetryAt: new Date(now.getTime() + 60000) },
    $inc: { confirmationEmailAttempts: 1 } }, { new: true });
  if (!claimed) return;
  try {
    const booking = await populateBooking(db.Booking.findById(bookingId));
    await sendBookingConfirmation(booking);
    await db.Booking.updateOne({ _id: bookingId }, { $set: { confirmationEmailStatus: "sent" } });
  } catch (error) {
    await db.Booking.updateOne({ _id: bookingId }, { $set: { confirmationEmailStatus: "pending" } });
    console.error("Booking email will be retried", { bookingId: String(bookingId), code: error.code || "MAIL_ERROR" });
  }
}

function startPaymentJobs() {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await expireBookings();
      const emails = await db.Booking.find({ status: "confirmed", paymentStatus: "paid",
        confirmationEmailStatus: { $in: ["pending", "sending"] },
        $or: [{ confirmationEmailRetryAt: { $exists: false } }, { confirmationEmailRetryAt: { $lte: new Date() } }],
      }).select("_id").limit(20);
      for (const booking of emails) await sendConfirmation(booking._id);
    } catch (error) {
      console.error("Payment background job failed", { code: error.code || "PAYMENT_JOB_ERROR" });
    } finally { running = false; }
  };
  const timer = setInterval(tick, 15000);
  timer.unref();
  void tick();
  return timer;
}

module.exports = { populateBooking, releaseVoucher, expireBookings, sendConfirmation, startPaymentJobs };
