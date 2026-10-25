import type { UiMovie } from "./types";
import type { Showtime } from "../../services/showtimeService";

interface ShowtimeModalProps {
  movie: UiMovie | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  showtimes: Showtime[];
  loading: boolean;
  onClose: () => void;
  onSelectShowtime: (showtime: Showtime) => void;
}

// Currency format helper
const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ShowtimeModal({
  movie,
  selectedDate,
  onDateChange,
  showtimes,
  loading,
  onClose,
  onSelectShowtime,
}: ShowtimeModalProps) {
  if (!movie) return null;

  // Build dates list: today and next 2 days
  const dateOptions = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    let label = offset === 0 ? "Hôm nay" : offset === 1 ? "Ngày mai" : "Ngày kia";
    const dayMonth = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, label: `${label} (${dayMonth})` };
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#161626",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7)",
          padding: "1.8rem",
          color: "#fff",
        }}
      >
        {/* Header with Movie details and Close button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                style={{ width: "70px", height: "95px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: "70px",
                  height: "95px",
                  borderRadius: "8px",
                  background: movie.posterColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                N
              </div>
            )}
            <div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ background: "#e8173a", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {movie.rating}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{movie.duration}</span>
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700 }}>{movie.title}</h2>
              {movie.titleEn && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#8e8ea8", fontStyle: "italic" }}>
                  {movie.titleEn}
                </p>
              )}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      padding: "0.1rem 0.4rem",
                      fontSize: "0.72rem",
                      color: "#cbd5e1",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#8e8ea8", fontSize: "1.5rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Date Selector Tabs */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.2rem", marginBottom: "1.2rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#a0a0b0", fontWeight: 600, margin: "0 0 0.6rem" }}>
            📅 Chọn ngày xem phim:
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {dateOptions.map((opt) => (
              <button
                key={opt.dateStr}
                onClick={() => onDateChange(opt.dateStr)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: selectedDate === opt.dateStr ? "#e8173a" : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showtimes List */}
        <div>
          <p style={{ fontSize: "0.85rem", color: "#a0a0b0", fontWeight: 600, margin: "0 0 0.8rem" }}>
            🕒 Các suất chiếu hiện có:
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#8e8ea8" }}>
              Đang tải danh sách suất chiếu...
            </div>
          ) : showtimes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px",
                border: "1px dashed rgba(255,255,255,0.1)",
                color: "#8e8ea8",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🍿</div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Chưa có suất chiếu nào được xếp cho ngày này. Vui lòng chọn ngày khác!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.8rem" }}>
              {showtimes.map((st) => {
                const startTimeStr = new Date(st.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTimeStr = new Date(st.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={st._id}
                    onClick={() => onSelectShowtime(st)}
                    style={{
                      background: "#0f0f1c",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "10px",
                      padding: "0.8rem 0.6rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s, border-color 0.15s, background 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#e8173a";
                      (e.currentTarget as HTMLElement).style.background = "#1b1424";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                      (e.currentTarget as HTMLElement).style.background = "#0f0f1c";
                    }}
                  >
                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff" }}>
                      {startTimeStr}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      ~ {endTimeStr}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 600, marginTop: "2px" }}>
                      {st.roomId?.name} ({st.roomId?.roomType})
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#4ade80", fontWeight: 700, marginTop: "2px" }}>
                      {formatVND(st.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", color: "#717188", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>* Bấm vào khung giờ để chọn chỗ ngồi và đặt vé.</span>
          <button
            onClick={onClose}
            style={{
              padding: "0.45rem 1rem",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
