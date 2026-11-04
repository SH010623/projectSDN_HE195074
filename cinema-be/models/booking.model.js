const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    showtimeId: {
      type: Schema.Types.ObjectId,
      ref: "Showtime",
      required: [true, "Showtime is required"],
    },
    seats: {
      type: [String],
      required: [true, "Seats are required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one seat must be selected",
      },
    },
    seatDetails: [
      {
        seatNumber: String,
        seatType: {
          type: String,
          enum: ["standard", "vip"],
          default: "standard",
        },
        price: Number,
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    voucherCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    finalPrice: {
      type: Number,
      required: [true, "Final price is required"],
      min: [0, "Final price cannot be negative"],
    },
    bookingCode: {
      type: String,
      required: [true, "Booking code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["sepay", "momo_mock", "vnpay_mock", "card_mock", "cash"],
      default: "sepay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "review"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },
    // Active seat locks use a unique multikey index. Expired/cancelled orders release it.
    seatLock: { type: Boolean, default: false },
    expiresAt: Date,
    paidAt: Date,
    sepayTransactionId: String,
    voucherReserved: { type: Boolean, default: false },
    confirmationEmailStatus: { type: String, enum: ["pending", "sending", "sent"], select: false },
    confirmationEmailRetryAt: { type: Date, select: false },
    confirmationEmailAttempts: { type: Number, default: 0, select: false },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ showtimeId: 1, status: 1 });
bookingSchema.index({ showtimeId: 1, seats: 1 }, {
  unique: true,
  partialFilterExpression: { seatLock: true },
  name: "unique_active_showtime_seat",
});
bookingSchema.index({ status: 1, expiresAt: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
