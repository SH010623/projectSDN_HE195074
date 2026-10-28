import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService, type Booking } from "../services/bookingService";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "cancelled">("all");
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  // Fetch tickets for current user
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getMyTickets();
      setBookings(data.bookings || []);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(errorMsg || "Không thể tải danh sách vé. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Handle ticket cancellation
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancellingId(cancelTarget._id);
      await bookingService.cancelBooking(cancelTarget._id);
      alert("Hủy vé thành công! Số ghế đã được giải phóng.");
      setCancelModalOpen(false);
      setCancelTarget(null);
      fetchMyTickets();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      alert(errorMsg || "Không thể hủy vé. Vui lòng kiểm tra lại thời gian suất chiếu!");
    } finally {
      setCancellingId(null);
    }
  };

  // Filter bookings based on active status tab
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f0f0f5] font-inter pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white/80 transition-colors flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <span>←</span> Bảng điều khiển
            </button>
            <div>
              <h1 className="text-xl font-black text-white">
                Vé Của Tôi
              </h1>
              <p className="text-xs text-[#8080a0]">Quản lý và tra cứu vé xem phim đã đặt tại rạp</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#e8173a] hover:bg-[#c91131] rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors cursor-pointer border-0"
          >
            + Đặt vé mới
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-8">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 mb-8">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
              filterStatus === "all"
                ? "bg-[#e8173a] text-white shadow-lg shadow-[#e8173a]/25"
                : "bg-white/5 text-[#9090b0] hover:text-white hover:bg-white/10"
            }`}
          >
            Tất cả ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
              filterStatus === "confirmed"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "bg-white/5 text-[#9090b0] hover:text-white hover:bg-white/10"
            }`}
          >
            Đã xác nhận ({bookings.filter((b) => b.status === "confirmed").length})
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
              filterStatus === "cancelled"
                ? "bg-rose-900/60 text-rose-300 shadow-lg shadow-rose-900/25"
                : "bg-white/5 text-[#9090b0] hover:text-white hover:bg-white/10"
            }`}
          >
            Đã hủy ({bookings.filter((b) => b.status === "cancelled").length})
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-[#e8173a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#8080a0]">Đang tải danh sách vé xem phim...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center mx-auto mb-2 text-sm">
              !
            </div>
            <p className="text-rose-300 font-semibold mb-4">{error}</p>
            <button
              onClick={fetchMyTickets}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="py-20 text-center bg-[#131320] border border-white/[0.06] rounded-3xl p-10 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white/40 mx-auto mb-4 tracking-wider">
              TICKETS
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Chưa có vé nào</h3>
            <p className="text-sm text-[#8080a0] mb-6">
              {filterStatus === "all"
                ? "Bạn chưa đặt vé xem phim nào tại Trung tâm Chiếu phim Quốc gia."
                : `Không tìm thấy vé nào ở trạng thái ${
                    filterStatus === "confirmed" ? "Đã xác nhận" : "Đã hủy"
                  }.`}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#e8173a] hover:bg-[#c91131] rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#e8173a]/30"
            >
              Khám phá phim đang chiếu ngay
            </button>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((ticket) => {
              const movie = ticket.showtimeId?.movieId;
              const room = ticket.showtimeId?.roomId;
              const isConfirmed = ticket.status === "confirmed";
              const showtimeDate = new Date(ticket.showtimeId?.startTime || ticket.bookingDate);
              const isPast = showtimeDate.getTime() < Date.now();

              return (
                <div
                  key={ticket._id}
                  className={`relative rounded-3xl bg-[#131320] border transition-all overflow-hidden flex flex-col justify-between ${
                    isConfirmed
                      ? "border-white/[0.08] hover:border-[#e8173a]/40 shadow-xl shadow-black/40"
                      : "border-rose-500/20 opacity-70 bg-[#161218]"
                  }`}
                >
                  {/* Ticket Header Banner */}
                  <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#e8173a] rounded flex items-center justify-center text-white text-[10px] font-black">
                        N
                      </div>
                      <span className="text-[11px] font-bold tracking-wider text-[#a0a0b8] uppercase">
                        TRUNG TÂM CHIẾU PHIM QUỐC GIA
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isConfirmed ? "Đã thanh toán (Mock)" : "Đã hủy"}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6 flex flex-col sm:flex-row gap-5">
                    {/* Poster Thumbnail */}
                    <div className="w-24 h-36 rounded-2xl overflow-hidden bg-[#0a0a10] border border-white/10 shrink-0 shadow-md">
                      {movie?.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-white/30">
                          NCC
                        </div>
                      )}
                    </div>

                    {/* Movie Info & Seat Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-white leading-snug line-clamp-1">
                            {movie?.title || "Phim chiếu rạp"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {movie?.rating && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#e8173a] text-white">
                                {movie.rating}
                              </span>
                            )}
                            <span className="text-xs text-[#8080a0]">
                              {movie?.duration ? `${movie.duration} phút` : "Suất chuẩn"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Showtime & Hall Details */}
                      <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#707088] block">
                            Suất chiếu
                          </span>
                          <span className="text-xs font-bold text-white mt-0.5 block">
                            {formatDateTime(ticket.showtimeId?.startTime)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#707088] block">
                            Phòng chiếu
                          </span>
                          <span className="text-xs font-bold text-amber-300 mt-0.5 block">
                            {room?.name || "Rạp số 1"} ({room?.roomType || "2D"})
                          </span>
                        </div>
                      </div>

                      {/* Seats List */}
                      <div className="mt-3">
                        <span className="text-[10px] uppercase font-bold text-[#707088] block mb-1">
                          Ghế đã chọn ({ticket.seats.length} ghế)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ticket.seatDetails && ticket.seatDetails.length > 0
                            ? ticket.seatDetails.map((s, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded text-xs font-black border ${
                                    s.seatType === "vip"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                      : "bg-white/10 text-white border-white/20"
                                  }`}
                                >
                                  {s.seatNumber}
                                  {s.seatType === "vip" && " (VIP)"}
                                </span>
                              ))
                            : ticket.seats.map((seat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-xs font-black bg-white/10 text-white border border-white/20"
                                >
                                  {seat}
                                </span>
                              ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cutout Divider Line */}
                  <div className="relative flex items-center px-4">
                    <div className="w-5 h-5 rounded-full bg-[#0d0d14] -ml-6 border-r border-white/[0.08]" />
                    <div className="flex-1 border-b-2 border-dashed border-white/10 mx-2" />
                    <div className="w-5 h-5 rounded-full bg-[#0d0d14] -mr-6 border-l border-white/[0.08]" />
                  </div>

                  {/* Ticket Footer Details & Actions */}
                  <div className="p-6 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#707088] block">
                        Mã vé / Tổng tiền
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-black text-[#f87083] bg-[#e8173a]/10 px-2 py-0.5 rounded border border-[#e8173a]/25">
                          {ticket.bookingCode}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          {formatCurrency(ticket.finalPrice)}
                        </span>
                      </div>
                      {ticket.discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                          (Đã giảm {formatCurrency(ticket.discountAmount)} qua voucher {ticket.voucherCode})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* View QR Code Button */}
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 flex items-center justify-center gap-1.5"
                      >
                        Xem mã vé
                      </button>

                      {/* Cancel Ticket Button (only if confirmed and not past) */}
                      {isConfirmed && !isPast && (
                        <button
                          onClick={() => {
                            setCancelTarget(ticket);
                            setCancelModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all cursor-pointer border border-rose-500/20 flex items-center justify-center gap-1"
                        >
                          Hủy vé
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code & Barcode Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#161626] border border-white/15 shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#e8173a]/20 border border-[#e8173a]/40 text-[#f87083] flex items-center justify-center text-xs font-mono font-black mx-auto mb-3">
              TICKET
            </div>
            <h3 className="text-lg font-black text-white">Mã Nhận Vé Vào Rạp</h3>
            <p className="text-xs text-[#8080a0] mt-1">
              Xuất trình mã này cho nhân viên soát vé tại rạp
            </p>

            {/* Simulated QR Code Canvas */}
            <div className="my-5 p-5 bg-white rounded-2xl inline-block shadow-inner">
              <div className="w-44 h-44 bg-[#000] p-2 flex flex-col justify-between rounded-lg">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                </div>
                {/* Visual barcode dots pattern */}
                <div className="text-white text-[8px] font-mono tracking-[0.2em] text-center select-none py-1 overflow-hidden">
                  ■■ □■ ■□■ □■■<br />
                  □■■ □■ ■■□ ■□<br />
                  ■□■ ■■ □■■ □■
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-10 h-10 border-2 border-dashed border-white/60 flex items-center justify-center">
                    <span className="text-[9px] text-white font-mono">NCC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Code Display */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-4 font-mono">
              <span className="text-[10px] text-[#707088] uppercase block">Mã đặt vé</span>
              <span className="text-lg font-black tracking-widest text-[#f87083]">
                {selectedTicket.bookingCode}
              </span>
            </div>

            <div className="text-left text-xs text-[#a0a0b8] space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] mb-6">
              <div>
                Phim: <strong className="text-white">{selectedTicket.showtimeId?.movieId?.title}</strong>
              </div>
              <div>
                Phòng: <strong className="text-white">{selectedTicket.showtimeId?.roomId?.name}</strong>
              </div>
              <div>
                Ghế:{" "}
                <strong className="text-amber-300">
                  {selectedTicket.seats.join(", ")}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 bg-[#e8173a] hover:bg-[#c91131] rounded-xl text-sm font-bold text-white transition-colors cursor-pointer border-0"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#161626] border border-rose-500/30 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-sm font-bold mx-auto mb-4">
              !
            </div>
            <h3 className="text-lg font-black text-white">Xác nhận hủy vé xem phim?</h3>
            <p className="text-xs text-[#a0a0b8] mt-2 leading-relaxed">
              Bạn có chắc chắn muốn hủy vé{" "}
              <strong className="text-rose-400 font-mono">{cancelTarget.bookingCode}</strong>{" "}
              với các ghế <strong className="text-white">{cancelTarget.seats.join(", ")}</strong>?
            </p>
            <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-left text-xs text-amber-300 leading-normal">
              Lưu ý: Sau khi hủy, ghế sẽ được mở lại cho khách khác đặt và trạng thái vé sẽ chuyển sang &quot;Đã hủy&quot;.
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setCancelTarget(null);
                }}
                disabled={Boolean(cancellingId)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer border-0 disabled:opacity-50"
              >
                Giữ lại vé
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={Boolean(cancellingId)}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancellingId ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
