import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../services/movieService";
import type { Movie, MoviePayload } from "../services/movieService";

const POPULAR_GENRES = [
  "Hành Động",
  "Hài",
  "Kinh Dị",
  "Tâm Lý",
  "Tình Cảm",
  "Gia Đình",
  "Phiêu Lưu",
  "Sci-Fi",
  "Hoạt Hình",
  "Tài Liệu",
];

export default function AdminMoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal thêm / sửa phim
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MoviePayload>({
    title: "",
    titleEn: "",
    genres: [],
    rating: "P",
    duration: 120,
    releaseDate: new Date().toISOString().split("T")[0],
    endDate: "",
    director: "",
    cast: [],
    description: "",
    poster: "",
    banner: "",
    trailerUrl: "",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
    status: "now_showing",
  });
  const [castInput, setCastInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal Trailer
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, [statusFilter, genreFilter]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      else params.status = "all";
      if (genreFilter !== "all") params.genre = genreFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await movieService.getMovies(params);
      setMovies(res.movies || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách phim",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleOpenAdd = () => {
    setEditingMovieId(null);
    setFormData({
      title: "",
      titleEn: "",
      genres: ["Hành Động"],
      rating: "P",
      duration: 120,
      releaseDate: new Date().toISOString().split("T")[0],
      endDate: "",
      director: "",
      cast: [],
      description: "",
      poster: "",
      banner: "",
      trailerUrl: "",
      language: "Tiếng Việt - Phụ đề Tiếng Anh",
      status: "now_showing",
    });
    setCastInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovieId(movie._id);
    const relDate = movie.releaseDate
      ? new Date(movie.releaseDate).toISOString().split("T")[0]
      : "";
    const eDate = movie.endDate
      ? new Date(movie.endDate).toISOString().split("T")[0]
      : "";

    setFormData({
      title: movie.title,
      titleEn: movie.titleEn || "",
      genres: movie.genres || [],
      rating: movie.rating || "P",
      duration: movie.duration,
      releaseDate: relDate,
      endDate: eDate,
      director: movie.director || "",
      cast: movie.cast || [],
      description: movie.description || "",
      poster: movie.poster || "",
      banner: movie.banner || "",
      trailerUrl: movie.trailerUrl || "",
      language: movie.language || "Tiếng Việt - Phụ đề Tiếng Anh",
      status: movie.status || "now_showing",
    });
    setCastInput(movie.cast ? movie.cast.join(", ") : "");
    setIsModalOpen(true);
  };

  const handleToggleGenre = (g: string) => {
    const current = Array.isArray(formData.genres) ? [...formData.genres] : [];
    const index = current.indexOf(g);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(g);
    }
    setFormData({ ...formData, genres: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: MoviePayload = {
        ...formData,
        cast: castInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      if (editingMovieId) {
        await movieService.updateMovie(editingMovieId, payload);
        setMessage({ type: "success", text: "Cập nhật thông tin phim thành công!" });
      } else {
        await movieService.createMovie(payload);
        setMessage({ type: "success", text: "Thêm phim mới thành công!" });
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi lưu thông tin phim");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá phim "${title}"?`)) return;
    try {
      await movieService.deleteMovie(id);
      setMessage({ type: "success", text: `Đã xoá phim "${title}"` });
      fetchMovies();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xoá phim");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "now_showing" | "coming_soon" | "ended"
  ) => {
    try {
      await movieService.updateMovieStatus(id, newStatus);
      setMessage({ type: "success", text: "Đã cập nhật trạng thái phim!" });
      fetchMovies();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể đổi trạng thái");
    }
  };



  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case "P":
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#10b981", color: "#fff" }}>P</span>;
      case "K":
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#06b6d4", color: "#fff" }}>K</span>;
      case "T13":
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#eab308", color: "#000" }}>T13</span>;
      case "T16":
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#f97316", color: "#fff" }}>T16</span>;
      case "T18":
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#ef4444", color: "#fff" }}>T18</span>;
      default:
        return <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, background: "#6b7280", color: "#fff" }}>{rating}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "now_showing":
        return <span style={{ padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>● Đang chiếu</span>;
      case "coming_soon":
        return <span style={{ padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>● Sắp chiếu</span>;
      case "ended":
        return <span style={{ padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "1px solid rgba(156,163,175,0.3)" }}>● Dừng chiếu</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", color: "#f0f0f5", fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.8rem" }}>🎬</span>
              <h1 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 800, letterSpacing: "-0.02em" }}>Quản lý Danh mục Phim</h1>
            </div>
            <p style={{ color: "#8e8ea8", margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              Quản lý phim đang chiếu, sắp chiếu, thông tin thời lượng, thể loại và trailer
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.65rem 1.25rem",
                background: "linear-gradient(135deg, #e8173a, #c0102f)",
                border: "none",
                color: "#fff",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
                boxShadow: "0 4px 14px rgba(232,23,58,0.3)",
              }}
            >
              + Thêm phim mới
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "0.65rem 1rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              ← Về Dashboard
            </button>
          </div>
        </div>

        {/* Thông báo */}
        {message && (
          <div
            style={{
              padding: "0.8rem 1.2rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              background: message.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: message.type === "success" ? "#86efac" : "#fca5a5",
              border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Bộ lọc và Tìm kiếm */}
        <div
          style={{
            background: "#141422",
            borderRadius: "14px",
            padding: "1.2rem",
            marginBottom: "1.5rem",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search box */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: "1 1 300px" }}>
            <input
              type="text"
              placeholder="Tìm theo tên phim, đạo diễn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "0.6rem 0.9rem",
                background: "#0a0a12",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.88rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.6rem 1.1rem",
                background: "#2563eb",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Tìm kiếm
            </button>
          </form>

          {/* Filters */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginRight: "0.5rem" }}>Trạng thái:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "#0a0a12",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="now_showing">Đang chiếu (Now Showing)</option>
                <option value="coming_soon">Sắp chiếu (Coming Soon)</option>
                <option value="ended">Đã dừng chiếu (Ended)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginRight: "0.5rem" }}>Thể loại:</label>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "#0a0a12",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              >
                <option value="all">Tất cả thể loại</option>
                {POPULAR_GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách phim */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#8e8ea8" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Đang tải danh sách phim...</p>
          </div>
        ) : movies.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "#141422",
              borderRadius: "16px",
              border: "1px dashed rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎞️</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Chưa có phim nào</h3>
            <p style={{ color: "#8e8ea8", margin: "0.5rem 0 1.5rem" }}>
              Hãy thêm bộ phim đầu tiên vào hệ thống rạp chiếu.
            </p>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.7rem 1.5rem",
                background: "linear-gradient(135deg, #e8173a, #c0102f)",
                border: "none",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Thêm phim mới ngay
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
            {movies.map((movie) => (
              <div
                key={movie._id}
                style={{
                  background: "#141422",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
              >
                {/* Poster / Header Card */}
                <div style={{ position: "relative", height: "180px", background: movie.bannerColor || "#1e1e30", overflow: "hidden" }}>
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: movie.posterColor || "#1f1f33", color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>
                      {movie.title}
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                    {getRatingBadge(movie.rating)}
                    {getStatusBadge(movie.status)}
                  </div>
                  {movie.trailerUrl && (
                    <button
                      onClick={() => setActiveTrailerUrl(movie.trailerUrl || null)}
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        padding: "0.35rem 0.75rem",
                        background: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ▶ Xem Trailer
                    </button>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                    {movie.title}
                  </h3>
                  {movie.titleEn && (
                    <div style={{ fontSize: "0.82rem", color: "#8e8ea8", marginBottom: "0.75rem", fontStyle: "italic" }}>
                      {movie.titleEn}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                    {movie.genres?.map((g) => (
                      <span
                        key={g}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.75rem",
                          color: "#d1d5db",
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#9ca3af", display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1rem" }}>
                    <div>⏱️ <strong>Thời lượng:</strong> {movie.duration} phút</div>
                    <div>📅 <strong>Khởi chiếu:</strong> {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("vi-VN") : "N/A"}</div>
                    {movie.director && <div>🎬 <strong>Đạo diễn:</strong> {movie.director}</div>}
                    {movie.cast && movie.cast.length > 0 && <div>👥 <strong>Diễn viên:</strong> {movie.cast.join(", ")}</div>}
                  </div>

                  {movie.description && (
                    <p style={{ fontSize: "0.82rem", color: "#808098", margin: "0 0 1.2rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {movie.description}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Quick status dropdown */}
                    <select
                      value={movie.status}
                      onChange={(e) => handleStatusChange(movie._id, e.target.value as any)}
                      style={{
                        padding: "0.35rem 0.6rem",
                        background: "#0d0d14",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "6px",
                        color: "#d1d5db",
                        fontSize: "0.75rem",
                      }}
                    >
                      <option value="now_showing">Đang chiếu</option>
                      <option value="coming_soon">Sắp chiếu</option>
                      <option value="ended">Dừng chiếu</option>
                    </select>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleOpenEdit(movie)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "#3b82f6",
                          border: "none",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id, movie.title)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "rgba(239,68,68,0.2)",
                          border: "1px solid rgba(239,68,68,0.4)",
                          borderRadius: "6px",
                          color: "#f87171",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Thêm / Sửa Phim */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: "1rem",
            }}
          >
            <div
              style={{
                background: "#161626",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "780px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                  {editingMovieId ? "✏️ Chỉnh sửa thông tin phim" : "🎬 Thêm phim mới vào rạp"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#8e8ea8", fontSize: "1.4rem", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                  
                  {/* Tên phim tiếng Việt */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Tên phim (Tiếng Việt) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Chị Em Thanh Tra 3"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Tên tiếng Anh */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Tên tiếng Anh (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Inspector Sisters 3"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Thời lượng */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Thời lượng (phút) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Phân loại độ tuổi */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Phân loại độ tuổi *
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value as any })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="P">P - Phổ biến cho mọi đối tượng</option>
                      <option value="K">K - Dưới 13 tuổi có người bảo hộ</option>
                      <option value="T13">T13 - Khán giả từ 13 tuổi trở lên</option>
                      <option value="T16">T16 - Khán giả từ 16 tuổi trở lên</option>
                      <option value="T18">T18 - Khán giả từ 18 tuổi trở lên</option>
                      <option value="C">C - Cấm phổ biến</option>
                    </select>
                  </div>

                  {/* Ngày khởi chiếu */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Ngày khởi chiếu *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Trạng thái chiếu
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="now_showing">Đang chiếu (Now Showing)</option>
                      <option value="coming_soon">Sắp chiếu (Coming Soon)</option>
                      <option value="ended">Đã dừng chiếu (Ended)</option>
                    </select>
                  </div>

                  {/* Đạo diễn */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Đạo diễn
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Trấn Thành, Lý Hải..."
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Diễn viên (ngăn cách bởi dấu phẩy) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Dàn diễn viên (cách nhau dấu phẩy)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Chi Pu, Kỳ Duyên, Steven Nguyễn"
                      value={castInput}
                      onChange={(e) => setCastInput(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Thể loại tags selector */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "#d1d5db" }}>
                    Thể loại phim:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {POPULAR_GENRES.map((g) => {
                      const selected = Array.isArray(formData.genres) && formData.genres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleToggleGenre(g)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            background: selected ? "#e8173a" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${selected ? "#e8173a" : "rgba(255,255,255,0.15)"}`,
                            color: "#fff",
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {selected ? "✓ " : "+ "}{g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Media Links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.2rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      URL Ảnh Poster (Ảnh dọc)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.poster}
                      onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      URL Trailer (Youtube)
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.trailerUrl}
                      onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                      style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Nội dung tóm tắt
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Giới thiệu cốt truyện của bộ phim..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "0.65rem 1.25rem",
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "0.65rem 1.5rem",
                      background: "linear-gradient(135deg, #e8173a, #c0102f)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "8px",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {saving ? "Đang lưu..." : editingMovieId ? "Lưu thay đổi" : "Tạo phim"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Trailer Preview */}
        {activeTrailerUrl && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.9)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div style={{ width: "100%", maxWidth: "800px", background: "#111", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ padding: "0.8rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontWeight: 600 }}>Trailer Preview</span>
                <button
                  onClick={() => setActiveTrailerUrl(null)}
                  style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: "1.5rem", textAlign: "center" }}>
                <p style={{ color: "#d1d5db", marginBottom: "1rem" }}>Trailer Link:</p>
                <a
                  href={activeTrailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "underline", wordBreak: "break-all" }}
                >
                  {activeTrailerUrl}
                </a>
                <div style={{ marginTop: "1.5rem" }}>
                  <a
                    href={activeTrailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "0.7rem 1.5rem",
                      background: "#e8173a",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Mở trên Youtube ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
