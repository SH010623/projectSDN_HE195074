import Icon from "../components/ui/Icon";
import AppSelect from "../components/AppSelect";
import React, { useEffect, useState } from "react";
import { showtimeService } from "../services/showtimeService";
import type { Showtime, ShowtimePayload } from "../services/showtimeService";
import { movieService } from "../services/movieService";
import type { Movie } from "../services/movieService";
import { roomService } from "../services/roomService";
import type { Room } from "../services/roomService";

// Helper to format ISO date to YYYY-MM-DD
const formatDateToYMD = (d: Date) => d.toISOString().split("T")[0];

// Helper to format currency VND
const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const showtimeStatusOptions = [
  { value: "opened", label: "Đang mở bán" },
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "closed", label: "Đã đóng" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function AdminShowtimesPage() {

  // State for showtimes list and available movies/rooms
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const todayStr = formatDateToYMD(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [movieFilter, setMovieFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(showtimes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleShowtimes = showtimes.slice(pageStart, pageStart + pageSize);

  // Notifications state
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal Create / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtimeId, setEditingShowtimeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShowtimePayload>({
    movieId: "",
    roomId: "",
    startTime: "",
    price: 85000,
    status: "opened",
  });
  const [modalConflictError, setModalConflictError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load movies and rooms on mount
  useEffect(() => {
    loadDependencies();
  }, []);

  // Fetch showtimes when filters change
  useEffect(() => {
    setPage(1);
    fetchShowtimes();
  }, [selectedDate, movieFilter, roomFilter, statusFilter]);

  // Load movies and rooms for dropdowns
  const loadDependencies = async () => {
    try {
      const [moviesRes, roomsRes] = await Promise.all([
        movieService.getMovies({ status: "all" }),
        roomService.getRooms(),
      ]);
      setMovies(moviesRes.movies || []);
      setRooms(roomsRes.rooms || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách phim và phòng chiếu",
      });
    }
  };

  // Fetch showtimes from backend API
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDate !== "all") params.date = selectedDate;
      if (movieFilter !== "all") params.movieId = movieFilter;
      if (roomFilter !== "all") params.roomId = roomFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await showtimeService.getShowtimes(params);
      setShowtimes(res.showtimes || []);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách suất chiếu",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating a new showtime
  const handleOpenAdd = () => {
    setEditingShowtimeId(null);
    setModalConflictError(null);

    // Default start time: today at next rounded hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFormData({
      movieId: movies[0]?._id || "",
      roomId: rooms[0]?._id || "",
      startTime: localIso,
      price: 85000,
      status: "opened",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing showtime
  const handleOpenEdit = (st: Showtime) => {
    setEditingShowtimeId(st._id);
    setModalConflictError(null);

    const localIso = new Date(new Date(st.startTime).getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFormData({
      movieId: typeof st.movieId === "object" ? st.movieId._id : st.movieId,
      roomId: typeof st.roomId === "object" ? st.roomId._id : st.roomId,
      startTime: localIso,
      price: st.price,
      status: st.status,
    });
    setIsModalOpen(true);
  };

  // Calculate estimated end time based on selected movie duration + 15m cleaning
  const getEstimatedEndTime = () => {
    if (!formData.startTime) return null;
    const selectedMovie = movies.find((m) => m._id === formData.movieId);
    const duration = selectedMovie?.duration || 120;
    const start = new Date(formData.startTime);
    if (isNaN(start.getTime())) return null;
    const end = new Date(start.getTime() + (duration + 15) * 60 * 1000);
    return end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle form submission with conflict detection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalConflictError(null);
    try {
      setSaving(true);
      const isoStartTime = new Date(formData.startTime).toISOString();

      if (editingShowtimeId) {
        await showtimeService.updateShowtime(editingShowtimeId, {
          ...formData,
          startTime: isoStartTime,
        });
        setMessage({ type: "success", text: "Cập nhật suất chiếu thành công!" });
      } else {
        await showtimeService.createShowtime({
          ...formData,
          startTime: isoStartTime,
        });
        setMessage({ type: "success", text: "Tạo suất chiếu mới thành công!" });
      }
      setIsModalOpen(false);
      fetchShowtimes();
    } catch (err: any) {
      const errText = err.response?.data?.message || "Lỗi khi lưu suất chiếu";
      setModalConflictError(errText);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete showtime
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá suất chiếu này?")) return;
    try {
      await showtimeService.deleteShowtime(id);
      setMessage({ type: "success", text: "Đã xoá suất chiếu thành công!" });
      fetchShowtimes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xoá suất chiếu");
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "opened":
        return (
          <span style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
            ● Đang mở bán
          </span>
        );
      case "scheduled":
        return (
          <span style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
            ● Đã lên lịch
          </span>
        );
      case "closed":
        return (
          <span style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "1px solid rgba(156,163,175,0.3)" }}>
            ● Đã kết thúc
          </span>
        );
      case "cancelled":
        return (
          <span style={{ padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
            ● Đã huỷ
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Room type color helper
  const getRoomTypeTag = (type?: string) => {
    const t = type || "2D";
    let bg = "#1f2937";
    let color = "#e5e7eb";
    if (t === "IMAX") {
      bg = "#1e3a8a";
      color = "#93c5fd";
    } else if (t === "3D") {
      bg = "#065f46";
      color = "#a7f3d0";
    } else if (t === "VIP") {
      bg = "#831843";
      color = "#fbcfe8";
    }
    return (
      <span style={{ padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, background: bg, color }}>
        {t}
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", color: "#f0f0f5", fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.8rem" }}><Icon name="clock" /></span>
              <h1 style={{ fontSize: "1.8rem", margin: 0, fontWeight: 800, letterSpacing: "-0.02em" }}>
                Quản lý Lịch chiếu & Suất chiếu
              </h1>
            </div>
            <p style={{ color: "#8e8ea8", margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
              Sắp xếp lịch chiếu phim theo phòng, kiểm tra trùng lặp giờ chiếu và quản lý giá vé
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
              + Thêm suất chiếu mới
            </button>

          </div>
        </div>

        {/* Notification Toast */}
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
              <Icon name="close" />
            </button>
          </div>
        )}

        {/* Filters and Date Bar */}
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
          {/* Chọn ngày chiếu */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <label htmlFor="showtime-date-filter" style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>Ngày chiếu:</label>
            <input
              id="showtime-date-filter"
              aria-label="Chọn ngày chiếu"
              type="date"
              value={selectedDate === "all" ? "" : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || "all")}
              style={{
                colorScheme: "dark",
                padding: "0.45rem 0.75rem",
                background: "#0a0a12",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "0.82rem",
              }}
            />
            {selectedDate !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedDate("all")}
                style={{
                  padding: "0.45rem 0.75rem",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Xem tất cả các ngày
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Filter by Movie */}
            <div>
              <AppSelect label="Lọc theo phim" value={movieFilter} onValueChange={setMovieFilter} options={[{ value: "all", label: "Tất cả phim" }, ...movies.map(m => ({ value: m._id, label: m.title }))]} />
            </div>

            {/* Filter by Room */}
            <div>
              <AppSelect label="Lọc theo phòng" value={roomFilter} onValueChange={setRoomFilter} options={[{ value: "all", label: "Tất cả phòng" }, ...rooms.map(r => ({ value: r._id, label: `${r.name} (${r.roomType})` }))]} />
            </div>

            {/* Filter by Status */}
            <div>
              <AppSelect label="Lọc theo trạng thái" value={statusFilter} onValueChange={setStatusFilter} options={[{ value: "all", label: "Tất cả trạng thái" }, ...showtimeStatusOptions]} />
            </div>
          </div>
        </div>

        {/* Showtimes List Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#8e8ea8" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}><Icon name="hourglass" /></div>
            <p>Đang tải danh sách suất chiếu...</p>
          </div>
        ) : showtimes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "#141422",
              borderRadius: "16px",
              border: "1px dashed rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}><Icon name="calendar" /></div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Không có suất chiếu nào</h3>
            <p style={{ color: "#8e8ea8", margin: "0.5rem 0 1.5rem" }}>
              Chưa có suất chiếu phù hợp với bộ lọc ngày hoặc phòng đã chọn.
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
              + Tạo suất chiếu ngay
            </button>
          </div>
        ) : (
          <div style={{ background: "#141422", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    <th style={{ padding: "1rem 1.2rem" }}>Khung giờ</th>
                    <th style={{ padding: "1rem" }}>Bộ phim</th>
                    <th style={{ padding: "1rem" }}>Phòng chiếu</th>
                    <th style={{ padding: "1rem" }}>Giá vé</th>
                    <th style={{ padding: "1rem" }}>Trạng thái</th>
                    <th style={{ padding: "1rem 1.2rem", textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleShowtimes.map((st) => {
                    const startObj = new Date(st.startTime);
                    const endObj = new Date(st.endTime);
                    const startTimeStr = startObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const endTimeStr = endObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const dateDisplay = startObj.toLocaleDateString("vi-VN");

                    return (
                      <tr
                        key={st._id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* Time Column */}
                        <td style={{ padding: "1rem 1.2rem", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                            {startTimeStr} <span style={{ color: "#6b7280", fontWeight: 400 }}>→</span> {endTimeStr}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px" }}>
                            <Icon name="calendar" /> {dateDisplay}
                          </div>
                        </td>

                        {/* Movie Column */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                            {st.movieId?.poster ? (
                              <img
                                src={st.movieId.poster}
                                alt={st.movieId.title}
                                style={{ width: "38px", height: "52px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "38px",
                                  height: "52px",
                                  borderRadius: "6px",
                                  background: st.movieId?.posterColor || "#252538",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.6rem",
                                  fontWeight: 700,
                                  color: "#fff",
                                  flexShrink: 0,
                                }}
                              >
                                {st.movieId?.title?.slice(0, 2) || "PH"}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.92rem" }}>
                                {st.movieId?.title || "Phim không xác định"}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#8e8ea8", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                                <span><Icon name="clock" /> {st.movieId?.duration || 120} phút</span>
                                <span>•</span>
                                <span style={{ color: "#f87171", fontWeight: 600 }}>{st.movieId?.rating || "P"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Room Column */}
                        <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{st.roomId?.name}</span>
                            {getRoomTypeTag(st.roomId?.roomType)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px" }}>
                            {st.roomId?.totalSeats || 50} ghế ngồi
                          </div>
                        </td>

                        {/* Price Column */}
                        <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                          <span style={{ fontWeight: 700, color: "#38bdf8", fontSize: "0.95rem" }}>
                            {formatVND(st.price)}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                          {getStatusBadge(st.status)}
                        </td>

                        {/* Actions Column */}
                        <td style={{ padding: "1rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                            <button
                              onClick={() => handleOpenEdit(st)}
                              style={{
                                padding: "0.35rem 0.7rem",
                                background: "#3b82f6",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(st._id)}
                              style={{
                                padding: "0.35rem 0.7rem",
                                background: "rgba(239,68,68,0.2)",
                                border: "1px solid rgba(239,68,68,0.4)",
                                borderRadius: "6px",
                                color: "#f87171",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && showtimes.length > 0 && (
          <nav aria-label="Phân trang lịch chiếu" className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-[#a0a0b0]">
            <p>Hiển thị {pageStart + 1}–{Math.min(pageStart + pageSize, showtimes.length)} / {showtimes.length} suất chiếu</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-white/15 px-4 py-2 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1).map((n, index, pages) => (
                <React.Fragment key={n}>
                  {index > 0 && n - pages[index - 1] > 1 && <span className="px-1">…</span>}
                  <button type="button" aria-label={`Trang ${n}`} aria-current={n === currentPage ? "page" : undefined} onClick={() => setPage(n)} className={`min-w-9 rounded-lg px-3 py-2 ${n === currentPage ? "bg-[#e8173a] text-white" : "border border-white/15 text-white hover:bg-white/10"}`}>{n}</button>
                </React.Fragment>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-white/15 px-4 py-2 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">Sau</button>
            </div>
          </nav>
        )}

        {/* Modal Thêm / Chỉnh sửa Suất chiếu */}
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
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
                  <Icon name={editingShowtimeId ? "edit" : "clock"} className="mr-2" />{editingShowtimeId ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#8e8ea8", fontSize: "1.4rem", cursor: "pointer" }}
                >
                  <Icon name="close" />
                </button>
              </div>

              {/* Conflict Error Notice */}
              {modalConflictError && (
                <div
                  style={{
                    padding: "0.8rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,0.15)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239,68,68,0.3)",
                    marginBottom: "1.2rem",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  <Icon name="alert" /> <strong>Lỗi xếp lịch:</strong> {modalConflictError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Chọn phim */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Chọn bộ phim *
                  </label>
                  <AppSelect label="Chọn bộ phim" required value={formData.movieId} onValueChange={movieId => setFormData({ ...formData, movieId })} options={movies.map(m => ({ value: m._id, label: `[${m.rating}] ${m.title} (${m.duration} phút)` }))} fullWidth />
                </div>

                {/* Chọn phòng chiếu */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Chọn phòng chiếu *
                  </label>
                  <AppSelect label="Chọn phòng chiếu" required value={formData.roomId} onValueChange={roomId => setFormData({ ...formData, roomId })} options={rooms.map(r => ({ value: r._id, label: `${r.name} - ${r.roomType} (${r.totalSeats} ghế)` }))} fullWidth />
                </div>

                {/* Thời gian bắt đầu */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Thời gian bắt đầu chiếu *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ width: "100%", padding: "0.7rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  />
                  {getEstimatedEndTime() && (
                    <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "0.4rem" }}>
                      <Icon name="info" /> Giờ kết thúc dự kiến: <strong>{getEstimatedEndTime()}</strong> (bao gồm 15 phút dọn phòng)
                    </div>
                  )}
                </div>

                {/* Giá vé và Trạng thái */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Giá vé cơ bản (VNĐ) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={5000}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.7rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                      Trạng thái ban đầu
                    </label>
                    <AppSelect label="Trạng thái suất chiếu" value={formData.status || "scheduled"} onValueChange={status => setFormData({ ...formData, status: status as Showtime["status"] })} options={showtimeStatusOptions} fullWidth />
                  </div>
                </div>

                {/* Action Buttons */}
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
                    {saving ? "Đang kiểm tra lịch..." : editingShowtimeId ? "Lưu thay đổi" : "Tạo suất chiếu"}
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
