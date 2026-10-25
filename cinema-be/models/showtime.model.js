const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const showtimeSchema = new Schema(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, "Date is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Base ticket price is required"],
      min: [0, "Price must be non-negative"],
      default: 80000,
    },
    status: {
      type: String,
      enum: ["scheduled", "opened", "closed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

showtimeSchema.index({ roomId: 1, startTime: 1, endTime: 1 });
showtimeSchema.index({ movieId: 1, date: 1 });

const Showtime = mongoose.model("Showtime", showtimeSchema);

module.exports = Showtime;
