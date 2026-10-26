const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề tin tức là bắt buộc"],
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Nội dung bài viết là bắt buộc"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    },
    category: {
      type: String,
      enum: ["Tin điện ảnh", "Khuyến mãi", "Sự kiện", "Thông báo"],
      default: "Tin điện ảnh",
    },
    author: {
      type: String,
      default: "Ban Quản Trị",
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
