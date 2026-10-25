const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Tên phim là bắt buộc"],
      trim: true,
    },
    titleEn: {
      type: String,
      trim: true,
      default: "",
    },
    genres: {
      type: [String],
      default: [],
    },
    rating: {
      type: String,
      enum: ["P", "K", "T13", "T16", "T18", "C"],
      default: "P",
    },
    duration: {
      type: Number,
      required: [true, "Thời lượng phim là bắt buộc (phút)"],
      min: [1, "Thời lượng phải lớn hơn 0 phút"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Ngày khởi chiếu là bắt buộc"],
    },
    endDate: {
      type: Date,
    },
    director: {
      type: String,
      trim: true,
      default: "",
    },
    cast: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    poster: {
      type: String,
      trim: true,
      default: "",
    },
    banner: {
      type: String,
      trim: true,
      default: "",
    },
    posterColor: {
      type: String,
      default: "linear-gradient(145deg, #1a0a2e 0%, #3d1155 50%, #6b21a8 100%)",
    },
    bannerColor: {
      type: String,
      default: "linear-gradient(135deg, #0d0720 0%, #1e0a3c 40%, #4c1d95 100%)",
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      default: "Tiếng Việt - Phụ đề Tiếng Anh",
      trim: true,
    },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "ended"],
      default: "now_showing",
    },
  },
  {
    timestamps: true,
  }
);

// Tự động gán status theo ngày nếu không được đặt thủ công
movieSchema.index({ title: "text", director: "text", genres: "text" });

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
