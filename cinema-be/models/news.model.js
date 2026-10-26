const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "News title is required"],
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: [true, "News content is required"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    },
    category: {
      type: String,
      enum: ["Movies", "Promotions", "Events", "Announcements"],
      default: "Movies",
    },
    author: {
      type: String,
      default: "Admin",
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", newsSchema);

module.exports = News;
