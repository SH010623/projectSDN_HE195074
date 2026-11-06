const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  bookingCode: String,
  amount: { type: Number, required: true },
  content: String,
  referenceCode: String,
  outcome: { type: String, enum: ["confirmed", "review", "unmatched"], required: true },
  reason: String,
}, { timestamps: true });

module.exports = mongoose.model("PaymentTransaction", schema);
