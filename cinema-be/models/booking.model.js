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
      enum: ["momo_mock", "vnpay_mock", "card_mock", "cash"],
      default: "momo_mock",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
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
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
