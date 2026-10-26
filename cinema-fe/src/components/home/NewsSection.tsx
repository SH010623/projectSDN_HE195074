import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newsService } from "../../services/newsService";
import type { NewsItem } from "../../services/newsService";

interface NewsSectionProps {
  id?: string;
}

export default function NewsSection({ id = "news" }: NewsSectionProps) {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      setLoading(true);
      const res = await newsService.getNews();
      // Take up to 4 latest active articles
      setNews(res.news.slice(0, 4));
    } catch (err) {
      console.error("Failed to load featured news", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (item: NewsItem) => {
    setReadingArticle(item);
    try {
      const res = await newsService.getNewsById(item._id);
      setReadingArticle(res.news);
    } catch (err) {
      console.error("Failed to fetch full article", err);
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
    <section className="py-16 bg-[#0a0a12] border-t border-white/[0.04]" id={id}>
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#e8173a] text-xs font-bold tracking-widest uppercase mb-1">
              <span>●</span>
              <span>Cập nhật mới nhất</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f0f5]">
              Tin tức điện ảnh & Sự kiện
            </h2>
          </div>

          <button
            onClick={() => navigate("/news")}
            className="text-sm font-semibold text-[#e8173a] hover:text-[#f87083] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>Xem tất cả tin tức</span>
            <span>&rsaquo;</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-[#8888a0]">Đang tải tin tức mới nhất...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-[#7070a0] bg-[#13131f] rounded-2xl border border-white/[0.06]">
            <p className="text-base font-medium">Hiện chưa có tin tức nào được hiển thị.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item) => (
              <article
                key={item._id}
                className="bg-[#141422] border border-white/[0.06] hover:border-white/20 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-[#0d0d14]">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[0.7rem] font-semibold border backdrop-blur-md ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[0.72rem] text-[#808098] mb-2">
                    <span>{new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
                    <span>{item.author || "Ban Quản Trị"}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-2 group-hover:text-[#f87083] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#a0a0b8] line-clamp-2 leading-relaxed flex-1 mb-4">
                    {item.summary || item.content}
                  </p>

                  <button
                    onClick={() => handleRead(item)}
                    className="w-full py-2 bg-white/5 hover:bg-[#e8173a] text-[#d0d0e0] hover:text-white border border-white/10 hover:border-transparent rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center"
                  >
                    Đọc bài viết →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161626] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Banner */}
            <div className="relative h-60 sm:h-72 w-full bg-[#0a0a12]">
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
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-3 leading-snug">
                {readingArticle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8888a0] pb-5 mb-5 border-b border-white/[0.08]">
                <span>Tác giả: <strong className="text-white">{readingArticle.author || "Ban Quản Trị"}</strong></span>
                <span>•</span>
                <span>Ngày đăng: {new Date(readingArticle.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
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
    </section>
  );
}
