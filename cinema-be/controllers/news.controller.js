const db = require("../models");

// GET /news - Get news list (Filtered for public, all for admin)
const getAllNews = async (req, res) => {
  try {
    const { category, search, all } = req.query;
    const query = {};

    // Only admins or explicit all=true see inactive news
    const isAdmin = req.role === "admin";
    if (!isAdmin || all !== "true") {
      query.isActive = true;
    }

    if (category && category !== "All") {
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
      message: "News fetched successfully",
      total: news.length,
      news,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /news/:id - Get single news detail & increment view count
const getNewsById = async (req, res) => {
  try {
    const newsItem = await db.News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!newsItem) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({
      message: "Article details fetched successfully",
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /news - Create new article (Admin only)
const createNews = async (req, res) => {
  try {
    const { title, summary, content, image, category, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newArticle = new db.News({
      title: title.trim(),
      summary: summary ? summary.trim() : "",
      content,
      image: image ? image.trim() : undefined,
      category: category || "Movies",
      author: author ? author.trim() : req.user?.name || "Admin",
      isActive: true,
    });

    await newArticle.save();

    return res.status(201).json({
      message: "Article published successfully",
      news: newArticle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /news/:id - Update article (Admin only)
const updateNews = async (req, res) => {
  try {
    const { title, summary, content, image, category, author } = req.body;

    const newsItem = await db.News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (title) newsItem.title = title.trim();
    if (summary !== undefined) newsItem.summary = summary.trim();
    if (content) newsItem.content = content;
    if (image) newsItem.image = image.trim();
    if (category) newsItem.category = category;
    if (author) newsItem.author = author.trim();

    await newsItem.save();

    return res.status(200).json({
      message: "Article updated successfully",
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /news/:id/toggle-status - Toggle article visibility (Admin only)
const toggleNewsStatus = async (req, res) => {
  try {
    const newsItem = await db.News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Article not found" });
    }

    newsItem.isActive = !newsItem.isActive;
    await newsItem.save();

    return res.status(200).json({
      message: `Article is now ${newsItem.isActive ? "Visible" : "Hidden"}`,
      news: newsItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /news/:id - Delete article (Admin only)
const deleteNews = async (req, res) => {
  try {
    const newsItem = await db.News.findByIdAndDelete(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({
      message: "Article deleted successfully",
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
