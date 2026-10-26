import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { newsService } from "../services/newsService";
import type { NewsItem } from "../services/newsService";

export default function NewsPage() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  const categories = ["Tất cả", "Tin điện ảnh", "Khuyến mãi", "Sự kiện", "Thông báo"];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== "Tất cả") params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await newsService.getNews(params);
      setNewsList(res.news);
    } catch (err) {
      console.error("Failed to load news", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const handleReadArticle = async (item: NewsItem) => {
    setReadingArticle(item);
    try {
      // Fetch full details and increment views on server
      const res = await newsService.getNewsById(item._id);
      setReadingArticle(res.news);
    } catch (err) {
      console.error("Failed to fetch article details", err);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Tin điện ảnh":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Khuyến mãi":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Sự kiện":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 bg-[#e8173a] flex items-center justify-center rounded-lg">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wider uppercase block">Tin Tức Điện Ảnh</span>
              <span className="text-xs text-[#a0a0b0]">Cập nhật phim ảnh, sự kiện & xu hướng</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vouchers")}
              className="px-4 py-2 bg-[#161626] border border-white/10 hover:border-white/20 text-sm font-medium rounded-xl text-emerald-300 transition-colors cursor-pointer"
            >
              🎟️ Xem Khuyến Mãi
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#161626] border border-white/10 hover:border-white/20 text-sm font-medium rounded-xl text-[#d0d0e0] hover:text-white transition-colors cursor-pointer"
            >
              ← Về Trang Chủ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Tin Tức & <span className="text-[#e8173a]">Sự Kiện Nổi Bật</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a0a0b0]">
            Cập nhật những chuyển động mới nhất của thế giới điện ảnh, các tuần lễ phim đặc sắc và ưu đãi từ cụm rạp.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-white/[0.08]">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-[#e8173a] text-white border-[#e8173a]"
                    : "bg-[#161626] text-[#a0a0b0] border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-[#161626] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60 w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer border-0"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#a0a0b0]">Đang tải danh sách bài viết...</div>
        ) : newsList.length === 0 ? (
          <div className="py-20 text-center text-[#a0a0b0]">
            Không tìm thấy bài viết nào trong danh mục "{selectedCategory}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <article
                key={item._id}
                className="bg-[#161626] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col group shadow-lg hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#0a0a12]">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-md ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[0.75rem] text-[#8888a0] mb-2">
                    <span>Tác giả: {item.author || "Ban Quản Trị"}</span>
                    <span>👁️ {item.views || 0} lượt xem</span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#f87083] transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#a0a0b0] line-clamp-3 mb-4 flex-1">
                    {item.summary || item.content}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[0.72rem] text-[#8888a0]">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      onClick={() => handleReadArticle(item)}
                      className="px-3.5 py-1.5 bg-[#e8173a]/15 hover:bg-[#e8173a] text-[#f87083] hover:text-white border border-[#e8173a]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Đọc chi tiết →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161626] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Cover image banner */}
            <div className="relative h-64 sm:h-72 w-full bg-[#0a0a12]">
              <img
                src={readingArticle.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center cursor-pointer border border-white/20 text-sm"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`px-3 py-1 rounded-md text-xs font-semibold border backdrop-blur-md ${getCategoryBadgeClass(readingArticle.category)}`}>
                  {readingArticle.category}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-snug">
                {readingArticle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8888a0] pb-6 mb-6 border-b border-white/[0.08]">
                <span>Tác giả: <strong className="text-white">{readingArticle.author || "Ban Quản Trị"}</strong></span>
                <span>•</span>
                <span>Ngày đăng: {new Date(readingArticle.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
                <span>•</span>
                <span>👁️ {readingArticle.views || 0} lượt xem</span>
              </div>

              {readingArticle.summary && (
                <div className="p-4 bg-[#0d0d14] border-l-4 border-[#e8173a] rounded-r-xl text-sm italic text-[#e0d0f0] mb-6">
                  {readingArticle.summary}
                </div>
              )}

              <div className="text-sm sm:text-base text-[#d1d5db] leading-relaxed whitespace-pre-line">
                {readingArticle.content}
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex justify-end">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer border-0"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
