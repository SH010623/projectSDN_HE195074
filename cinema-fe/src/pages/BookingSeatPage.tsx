import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import type { OccupiedSeatsResponse } from "../services/bookingService";
import { voucherService } from "../services/voucherService";

// Helper to format currency VND
const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function BookingSeatPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  // Booking data and seat state
  const [data, setData] = useState<OccupiedSeatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
    title: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"momo_mock" | "vnpay_mock" | "card_mock" | "cash">("momo_mock");

  // Payment process simulation modal
  const [isPayingModalOpen, setIsPayingModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);

  // Fetch showtime layout and occupied seats on mount
  useEffect(() => {
    if (showtimeId) {
      fetchSeatLayout(showtimeId);
    }
  }, [showtimeId]);

  const fetchSeatLayout = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getOccupiedSeats(id);
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải sơ đồ ghế của suất chiếu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center text-white font-inter">
        <div className="w-10 h-10 border-3 border-[#e8173a] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-400">Đang tải sơ đồ phòng chiếu và trạng thái ghế...</p>
      </div>
    );
  }

  if (error || !data || !data.showtime) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center text-white font-inter p-6 text-center">
        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
          Lỗi hệ thống
        </div>
        <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-400 mb-6">{error || "Không tìm thấy thông tin suất chiếu"}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-[#e8173a] rounded-lg text-white font-semibold cursor-pointer border-0"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const { showtime, occupiedSeats } = data;
  const room = showtime.roomId;
  const movie = showtime.movieId;

  const totalRows = room?.rows || 6;
  const seatsPerRow = room?.seatsPerRow || 10;
  const basePrice = showtime.price || 85000;
  const vipSurcharge = 15000;

  // Determine if a row is VIP (middle rows of the hall)
  const isRowVip = (rowIndex: number) => {
    return totalRows >= 4 && rowIndex >= 2 && rowIndex <= Math.min(totalRows - 2, 5);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return; // Seat already sold

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          alert("Bạn chỉ được chọn tối đa 8 ghế trong một lần đặt vé!");
          return prev;
        }
        return [...prev, seatId];
      }
    });
    // Reset applied voucher if seats change so calculation revalidates
    setAppliedVoucher(null);
  };

  // Calculate prices
  let subtotal = 0;
  selectedSeats.forEach((seat) => {
    const rowChar = seat.charAt(0).toUpperCase();
    const rowIndex = rowChar.charCodeAt(0) - 65;
    const isVip = isRowVip(rowIndex);
    subtotal += isVip ? basePrice + vipSurcharge : basePrice;
  });

  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalPrice = Math.max(0, subtotal - discount);

  // Apply voucher validation
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError(null);
    setVoucherLoading(true);

    try {
      const res = await voucherService.checkVoucher({
        code: voucherCode.trim(),
        orderTotal: subtotal,
      });
      if (res.voucher) {
        setAppliedVoucher({
          code: res.voucher.code,
          discountAmount: res.discountAmount,
          title: res.voucher.title,
        });
      } else {
        setVoucherError(res.message || "Mã voucher không hợp lệ");
      }
    } catch (err: any) {
      setVoucherError(err.response?.data?.message || "Lỗi khi kiểm tra mã voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  // Confirm booking & execute mock payment
  const handleExecutePayment = async () => {
    try {
      setProcessingPayment(true);
      const payload = {
        showtimeId: showtime._id,
        seats: selectedSeats,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        paymentMethod,
      };

      const res = await bookingService.createBooking(payload);
      setBookingSuccessCode(res.booking.bookingCode);
    } catch (err: any) {
      alert(err.response?.data?.message || "Đặt vé thất bại. Vui lòng thử lại!");
      setIsPayingModalOpen(false);
      // Refresh seat layout in case of race condition
      if (showtimeId) fetchSeatLayout(showtimeId);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f0f0f5] font-inter pb-16">
      {/* ── TOP NAVBAR / BREADCRUMB ──────────────────────── */}
      <header className="bg-[#12121f] border-b border-white/[0.08] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 border border-white/10 cursor-pointer transition-colors"
            >
              ← Trang chủ
            </button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{movie?.title}</span>
                <span className="text-xs px-2 py-0.5 bg-[#e8173a] rounded font-semibold">
                  {movie?.rating || "P"}
                </span>
                <span className="text-xs px-2 py-0.5 bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 rounded font-semibold">
                  {room?.roomType}
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Phòng: {room?.name} • Giờ: {new Date(showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(showtime.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Ngày {showtime.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span className="text-[#e8173a]">1. Chọn ghế</span>
            <span>/</span>
            <span>2. Thanh toán</span>
            <span>/</span>
            <span>3. Nhận vé</span>
          </div>
        </div>
      </header>

      {/* ── MAIN SEATING AREA + CHECKOUT SIDEBAR ─────────── */}
      <main className="max-w-[1280px] mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SEAT MAP (8 COLS) */}
        <section className="lg:col-span-8 flex flex-col items-center">
          
          {/* Curved glowing screen */}
          <div className="w-full max-w-[580px] flex flex-col items-center mb-12">
            <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-[#e8173a] to-transparent rounded-t-full shadow-[0_0_25px_#e8173a]" />
            <div className="w-full h-10 bg-gradient-to-b from-[#e8173a]/20 to-transparent flex items-center justify-center">
              <span className="text-[0.72rem] tracking-[0.3em] font-bold text-gray-400 uppercase">
                MÀN HÌNH CHIẾU (SCREEN)
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="w-full overflow-x-auto flex flex-col items-center pb-6">
            <div className="flex flex-col gap-2.5 min-w-[340px]">
              {Array.from({ length: totalRows }).map((_, rIdx) => {
                const rowChar = String.fromCharCode(65 + rIdx); // A, B, C...
                const isVip = isRowVip(rIdx);

                return (
                  <div key={rowChar} className="flex items-center gap-2">
                    {/* Row Label Left */}
                    <span className="w-6 text-center text-xs font-bold text-gray-400">
                      {rowChar}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex gap-2">
                      {Array.from({ length: seatsPerRow }).map((_, sIdx) => {
                        const seatNumber = `${rowChar}${sIdx + 1}`;
                        const isOccupied = occupiedSeats.includes(seatNumber);
                        const isSelected = selectedSeats.includes(seatNumber);

                        let seatBg = "bg-[#1f1f33] border-white/10 text-gray-300 hover:border-white/30";
                        if (isOccupied) {
                          seatBg = "bg-[#101018] border-white/5 text-gray-600 cursor-not-allowed opacity-50";
                        } else if (isSelected) {
                          seatBg = "bg-[#e8173a] border-[#e8173a] text-white shadow-[0_0_12px_rgba(232,23,58,0.7)] scale-105";
                        } else if (isVip) {
                          seatBg = "bg-[#2d1f10] border-amber-600/40 text-amber-300 hover:border-amber-500";
                        }

                        return (
                          <button
                            key={seatNumber}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => handleToggleSeat(seatNumber)}
                            title={
                              isOccupied
                                ? `Ghế ${seatNumber} đã bán`
                                : `Ghế ${seatNumber} (${isVip ? "VIP - " + formatVND(basePrice + vipSurcharge) : "Thường - " + formatVND(basePrice)})`
                            }
                            className={`w-8 h-8 rounded-t-lg rounded-b-sm border text-[0.7rem] font-bold flex items-center justify-center transition-all cursor-pointer ${seatBg}`}
                          >
                            {isOccupied ? "X" : seatNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span className="w-6 text-center text-xs font-bold text-gray-400">
                      {rowChar}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 py-3 px-6 bg-[#141424] rounded-full border border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#1f1f33] border border-white/10 rounded-t-md" />
              <span>Ghế thường ({formatVND(basePrice)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#2d1f10] border border-amber-600/40 rounded-t-md" />
              <span className="text-amber-300">Ghế VIP ({formatVND(basePrice + vipSurcharge)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#e8173a] border border-[#e8173a] rounded-t-md shadow-[0_0_8px_#e8173a]" />
              <span className="text-white font-semibold">Đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#101018] border border-white/5 rounded-t-md flex items-center justify-center text-gray-600 font-bold text-[0.6rem]">X</div>
              <span className="text-gray-500">Đã bán</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: CHECKOUT SUMMARY SIDEBAR (4 COLS) */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-[#141424] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <h2 className="text-base font-bold text-white border-b border-white/[0.08] pb-3 flex items-center justify-between">
              <span>Thông tin đặt vé</span>
              <span className="text-xs font-normal text-gray-400">
                {selectedSeats.length} ghế đã chọn
              </span>
            </h2>

            {/* Movie preview snippet */}
            <div className="flex gap-3 items-center">
              {movie?.poster && (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-14 h-20 object-cover rounded-lg border border-white/10 shrink-0"
                />
              )}
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{movie?.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{room?.name} • {room?.roomType}</p>
                <p className="text-xs text-rose-400 font-semibold mt-1">
                  Suất: {new Date(showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {showtime.date}
                </p>
              </div>
            </div>

            {/* Selected seats pills */}
            <div className="border-t border-b border-white/[0.06] py-3">
              <div className="text-xs font-semibold text-gray-400 mb-2">Ghế đang chọn:</div>
              {selectedSeats.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Vui lòng chọn ghế trên sơ đồ</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-2.5 py-1 bg-[#e8173a]/20 border border-[#e8173a]/40 text-[#f87083] rounded-md text-xs font-bold flex items-center gap-1.5"
                    >
                      {seat}
                      <button
                        type="button"
                        onClick={() => handleToggleSeat(seat)}
                        className="hover:text-white cursor-pointer"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Mã giảm giá (Voucher):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã (VD: XINCHAO2026)"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherError(null);
                  }}
                  disabled={selectedSeats.length === 0}
                  className="flex-1 bg-[#0b0b14] border border-white/15 rounded-lg px-3 py-2 text-xs text-white uppercase placeholder-gray-600 focus:outline-none focus:border-[#e8173a]"
                />
                <button
                  type="button"
                  disabled={selectedSeats.length === 0 || voucherLoading || !voucherCode.trim()}
                  onClick={handleApplyVoucher}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  {voucherLoading ? "..." : "Áp dụng"}
                </button>
              </div>
              {voucherError && (
                <p className="text-[0.72rem] text-rose-400 mt-1">{voucherError}</p>
              )}
              {appliedVoucher && (
                <p className="text-[0.72rem] text-emerald-400 mt-1 font-semibold">
                  Đã áp dụng: {appliedVoucher.title} (-{formatVND(appliedVoucher.discountAmount)})
                </p>
              )}
            </div>

            {/* Payment method selector (Mock) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Phương thức thanh toán (Tạm giả lập):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "momo_mock", label: "Ví MoMo", tag: "MOMO" },
                  { id: "vnpay_mock", label: "Cổng VNPAY", tag: "VNPAY" },
                  { id: "card_mock", label: "Thẻ ATM/Visa", tag: "CARD" },
                  { id: "cash", label: "Tiền mặt quầy", tag: "CASH" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id as any)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === item.id
                        ? "bg-[#e8173a]/15 border-[#e8173a] text-white"
                        : "bg-[#0b0b14] border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono font-bold text-white/80">
                      {item.tag}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-white/[0.08] pt-3 flex flex-col gap-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Tạm tính vé:</span>
                <span className="text-gray-200">{formatVND(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá voucher:</span>
                  <span>-{formatVND(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                <span>Tổng cộng:</span>
                <span className="text-lg text-[#e8173a]">{formatVND(finalPrice)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() => setIsPayingModalOpen(true)}
              className="w-full py-3 bg-[#e8173a] hover:bg-[#c91131] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-[#e8173a]/30 transition-all cursor-pointer text-sm"
            >
              {selectedSeats.length === 0
                ? "Vui lòng chọn ghế"
                : `Thanh toán ${formatVND(finalPrice)}`}
            </button>
          </div>
        </section>
      </main>

      {/* ── MOCK PAYMENT PROCESSING MODAL ────────────────── */}
      {isPayingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161626] border border-white/15 rounded-2xl w-full max-w-[460px] p-6 text-white shadow-2xl flex flex-col items-center text-center">
            
            {bookingSuccessCode ? (
              // Success Screen
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center text-3xl mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-bold mb-1">Đặt vé thành công!</h3>
                <p className="text-xs text-gray-400 mb-5">
                  Giao dịch thanh toán giả lập đã được hệ thống phê duyệt.
                </p>

                <div className="w-full bg-[#0d0d18] border border-white/10 rounded-xl p-4 mb-6 text-left">
                  <div className="text-xs text-gray-400 mb-1">Mã vé xem phim:</div>
                  <div className="text-xl font-extrabold text-[#e8173a] tracking-widest uppercase mb-3">
                    {bookingSuccessCode}
                  </div>
                  <div className="text-xs text-gray-300 flex flex-col gap-1">
                    <div><strong>Phim:</strong> {movie?.title}</div>
                    <div><strong>Phòng:</strong> {room?.name} ({room?.roomType})</div>
                    <div><strong>Ghế:</strong> {selectedSeats.join(", ")}</div>
                    <div><strong>Đã thanh toán:</strong> {formatVND(finalPrice)}</div>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => navigate("/my-tickets")}
                    className="flex-1 py-2.5 bg-[#e8173a] hover:bg-[#c91131] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Xem vé của tôi
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                  >
                    Về Trang chủ
                  </button>
                </div>
              </div>
            ) : (
              // Payment Processing / Mock Confirmation
              <div className="flex flex-col items-center w-full">
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase rounded-md mb-3">
                  {paymentMethod.toUpperCase()}
                </div>
                <h3 className="text-lg font-bold mb-1">
                  Xác nhận thanh toán giả lập
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Hệ thống đang mô phỏng cổng thanh toán{" "}
                  <strong className="text-white">
                    {paymentMethod === "momo_mock" ? "Ví MoMo" : paymentMethod === "vnpay_mock" ? "Cổng VNPAY" : "Thẻ ATM/Visa"}
                  </strong>
                </p>

                {/* Mock QR / Card UI */}
                <div className="w-48 h-48 bg-white rounded-xl p-3 flex flex-col items-center justify-center mb-4 shadow-lg">
                  <div className="w-full h-full border-4 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center p-2 text-center text-gray-800">
                    <span className="text-xs font-mono font-black text-gray-400 mb-1">NCC-PAY</span>
                    <span className="text-[0.65rem] font-bold uppercase">Mã QR Thanh Toán Giả Lập</span>
                    <span className="text-[0.6rem] text-gray-500 mt-1">{formatVND(finalPrice)}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  Bấm nút bên dưới để hoàn tất giả lập thanh toán và giữ chỗ ngay lập tức.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={() => setIsPayingModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={handleExecutePayment}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
                  >
                    {processingPayment ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
