import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AdminShowtimesPage() {
  const navigate = useNavigate();

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

  // Quick toggle showtime status
  const handleStatusChange = async (
    id: string,
    newStatus: "scheduled" | "opened" | "closed" | "cancelled"
  ) => {
    try {
      await showtimeService.updateShowtimeStatus(id, newStatus);
      setMessage({ type: "success", text: "Đã cập nhật trạng thái suất chiếu!" });
      fetchShowtimes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái");
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
              <span style={{ fontSize: "1.8rem" }}>🕒</span>
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
              ✕
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
          {/* Quick Date Selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>Ngày chiếu:</span>
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: selectedDate === todayStr ? "#e8173a" : "rgba(255,255,255,0.06)",
                color: "#fff",
              }}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => {
                const tmr = new Date();
                tmr.setDate(tmr.getDate() + 1);
                setSelectedDate(formatDateToYMD(tmr));
              }}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background:
                  selectedDate === formatDateToYMD(new Date(Date.now() + 86400000))
                    ? "#e8173a"
                    : "rgba(255,255,255,0.06)",
                color: "#fff",
              }}
            >
              Ngày mai
            </button>
            <input
              type="date"
              value={selectedDate === "all" ? "" : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || "all")}
              style={{
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
              <select
                value={movieFilter}
                onChange={(e) => setMovieFilter(e.target.value)}
                style={{
                  padding: "0.5rem 0.8rem",
                  background: "#0a0a12",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.82rem",
                  maxWidth: "180px",
                }}
              >
                <option value="all">Tất cả phim</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Room */}
            <div>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                style={{
                  padding: "0.5rem 0.8rem",
                  background: "#0a0a12",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.82rem",
                }}
              >
                <option value="all">Tất cả phòng</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.roomType})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "0.5rem 0.8rem",
                  background: "#0a0a12",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.82rem",
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="opened">Đang mở bán</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="closed">Đã kết thúc</option>
                <option value="cancelled">Đã huỷ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Showtimes List Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#8e8ea8" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
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
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
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
                  {showtimes.map((st) => {
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
                            📅 {dateDisplay}
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
                                <span>⏱️ {st.movieId?.duration || 120} phút</span>
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
                            {/* Quick status dropdown */}
                            <select
                              value={st.status}
                              onChange={(e) => handleStatusChange(st._id, e.target.value as any)}
                              style={{
                                padding: "0.35rem 0.55rem",
                                background: "#0a0a12",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "6px",
                                color: "#cbd5e1",
                                fontSize: "0.75rem",
                              }}
                            >
                              <option value="opened">Mở bán</option>
                              <option value="scheduled">Lên lịch</option>
                              <option value="closed">Đóng</option>
                              <option value="cancelled">Huỷ</option>
                            </select>

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
                  {editingShowtimeId ? "✏️ Chỉnh sửa suất chiếu" : "🕒 Thêm suất chiếu mới"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#8e8ea8", fontSize: "1.4rem", cursor: "pointer" }}
                >
                  ✕
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
                  ⚠️ <strong>Lỗi xếp lịch:</strong> {modalConflictError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Chọn phim */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Chọn bộ phim *
                  </label>
                  <select
                    required
                    value={formData.movieId}
                    onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                    style={{ width: "100%", padding: "0.7rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        [{m.rating}] {m.title} ({m.duration} phút)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chọn phòng chiếu */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d1d5db" }}>
                    Chọn phòng chiếu *
                  </label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    style={{ width: "100%", padding: "0.7rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                  >
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} - Định dạng {r.roomType} ({r.totalSeats} ghế)
                      </option>
                    ))}
                  </select>
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
                      ℹ️ Giờ kết thúc dự kiến: <strong>{getEstimatedEndTime()}</strong> (bao gồm 15 phút dọn phòng)
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
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      style={{ width: "100%", padding: "0.7rem", background: "#0a0a12", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="opened">Đang mở bán</option>
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="closed">Đã kết thúc</option>
                      <option value="cancelled">Đã huỷ</option>
                    </select>
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
