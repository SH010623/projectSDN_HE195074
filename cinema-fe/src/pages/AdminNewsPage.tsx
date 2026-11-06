import AppSelect from "../components/AppSelect";
import React, { useEffect, useState } from "react";
import { newsService } from "../services/newsService";
import type { NewsItem, NewsPayload } from "../services/newsService";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsPayload>({
    title: "",
    category: "Tin điện ảnh",
    summary: "",
    content: "",
    image: "",
    author: "Ban Quản Trị",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [categoryFilter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params: any = { all: "true" };
      if (categoryFilter !== "Tất cả") params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await newsService.getNews(params);
      setNewsList(res.news);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách bài viết",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Tin điện ảnh",
      summary: "",
      content: "",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
      author: "Ban Quản Trị",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      category: item.category,
      summary: item.summary || "",
      content: item.content,
      image: item.image || "",
      author: item.author || "Ban Quản Trị",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await newsService.updateNews(editingId, formData);
        setMessage({ type: "success", text: "Cập nhật bài viết thành công" });
      } else {
        await newsService.createNews(formData);
        setMessage({ type: "success", text: "Thêm bài viết mới thành công" });
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: NewsItem) => {
    try {
      const res = await newsService.toggleNewsStatus(item._id);
      setMessage({ type: "success", text: res.message });
      fetchNews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể thay đổi trạng thái bài viết");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;
    try {
      await newsService.deleteNews(id);
      setMessage({ type: "success", text: "Đã xóa bài viết thành công" });
      fetchNews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xóa bài viết");
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Tin điện ảnh":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "Khuyến mãi":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Sự kiện":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      default:
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white font-inter p-6 sm:p-8">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Quản Lý Tin Tức & Bài Viết</h1>
            <p className="text-[#a0a0b0] text-sm mt-1">Đăng tải bài viết tin tức điện ảnh, sự kiện và thông báo của rạp</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer border-0 shadow-lg shadow-red-950/40"
            >
              + Thêm Bài Viết
            </button>

          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm border ${
              message.type === "success"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-[#161626] border border-white/[0.06] rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc tóm tắt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer border-0"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a0a0b0] uppercase tracking-wider">Danh mục:</span>
            <AppSelect label="Danh mục" value={categoryFilter || ""} onValueChange={value => setCategoryFilter(value)} options={[{"value": "Tất cả", "label": "Tất cả danh mục"}, {"value": "Tin điện ảnh", "label": "Tin điện ảnh"}, {"value": "Khuyến mãi", "label": "Khuyến mãi"}, {"value": "Sự kiện", "label": "Sự kiện"}, {"value": "Thông báo", "label": "Thông báo"}]} />
          </div>
        </div>

        {/* News Table */}
        <div className="bg-[#161626] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#a0a0b0] font-medium text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Bài viết</th>
                  <th className="py-4 px-4">Danh mục</th>
                  <th className="py-4 px-4">Tác giả</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#a0a0b0]">
                      Đang tải danh sách bài viết...
                    </td>
                  </tr>
                ) : newsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#a0a0b0]">
                      Chưa có bài viết nào. Bấm "+ Thêm Bài Viết" để tạo bài viết đầu tiên.
                    </td>
                  </tr>
                ) : (
                  newsList.map((item) => (
                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"}
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0 bg-[#0d0d14]"
                          />
                          <div className="max-w-[360px]">
                            <h3 className="font-semibold text-white leading-snug line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-[#a0a0b0] line-clamp-1 mt-0.5">{item.summary || "Không có tóm tắt"}</p>
                            <span className="text-[0.7rem] text-[#6b7280] block mt-1">
                              {new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#d1d5db] font-medium">{item.author || "Ban Quản Trị"}</td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            item.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                          }`}
                        >
                          {item.isActive ? "● Đang hiển thị" : "○ Đang ẩn"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-[#c4b5fd] transition-colors cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              item.isActive
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                          >
                            {item.isActive ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.title)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161626] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-[620px] w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-xl font-bold mb-5">
                {editingId ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Tiêu đề bài viết (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề tin tức..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#e8173a]/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Danh mục</label>
                    <AppSelect label="Danh mục" value={formData.category || ""} onValueChange={value => setFormData({ ...formData, category: value as any })} options={[{"value": "Tin điện ảnh", "label": "Tin điện ảnh"}, {"value": "Khuyến mãi", "label": "Khuyến mãi"}, {"value": "Sự kiện", "label": "Sự kiện"}, {"value": "Thông báo", "label": "Thông báo"}]} fullWidth />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Tác giả</label>
                    <input
                      type="text"
                      placeholder="VD: Ban Biên Tập Rạp"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Ảnh bìa (Đường dẫn URL)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Tóm tắt ngắn</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả tóm tắt nội dung để hiển thị trên danh sách..."
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#a0a0b0] mb-1">Nội dung chi tiết (*)</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Nhập toàn bộ nội dung bài viết..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-transparent border border-white/20 hover:border-white/40 text-[#a0a0b0] hover:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#e8173a] hover:bg-[#c91131] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer border-0"
                  >
                    {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Xuất bản bài viết"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
