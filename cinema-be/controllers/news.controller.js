const db = require("../models");

// GET /news - Lấy danh sách tin tức
const getAllNews = async (req, res) => {
  try {
    const { category, search, all } = req.query;
    const query = {};

    const isAdmin = req.role === "admin";
    if (!isAdmin || all !== "true") {
      query.isActive = true;
    }

    if (category && category !== "Tất cả" && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { summary: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const news = await db.News.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách tin tức thành công",
      total: news.length,
      news,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /news/:id - Xem chi tiết bài viết & tăng lượt xem
const getNewsById = async (req, res) => {
  try {
    const newsItem = await db.News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!newsItem) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết bài viết thành công",
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /news - Tạo bài viết mới (Chỉ Admin)
const createNews = async (req, res) => {
  try {
    const { title, summary, content, image, category, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề và nội dung bài viết" });
    }

    const newArticle = new db.News({
      title: title.trim(),
      summary: summary ? summary.trim() : "",
      content,
      image: image ? image.trim() : undefined,
      category: category || "Tin điện ảnh",
      author: author ? author.trim() : req.user?.name || "Ban Quản Trị",
      isActive: true,
    });

    await newArticle.save();

    return res.status(201).json({
      message: "Đăng bài viết mới thành công",
      news: newArticle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /news/:id - Cập nhật bài viết (Chỉ Admin)
const updateNews = async (req, res) => {
  try {
    const { title, summary, content, image, category, author } = req.body;

    const newsItem = await db.News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (title) newsItem.title = title.trim();
    if (summary !== undefined) newsItem.summary = summary.trim();
    if (content) newsItem.content = content;
    if (image) newsItem.image = image.trim();
    if (category) newsItem.category = category;
    if (author) newsItem.author = author.trim();

    await newsItem.save();

    return res.status(200).json({
      message: "Cập nhật bài viết thành công",
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /news/:id/toggle-status - Ẩn / Hiện bài viết (Chỉ Admin)
const toggleNewsStatus = async (req, res) => {
  try {
    const newsItem = await db.News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    newsItem.isActive = !newsItem.isActive;
    await newsItem.save();

    return res.status(200).json({
      message: `Bài viết hiện đang ở trạng thái: ${newsItem.isActive ? "Hiển thị" : "Đã ẩn"}`,
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /news/:id - Xóa bài viết (Chỉ Admin)
const deleteNews = async (req, res) => {
  try {
    const newsItem = await db.News.findByIdAndDelete(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    return res.status(200).json({
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  toggleNewsStatus,
  deleteNews,
};
