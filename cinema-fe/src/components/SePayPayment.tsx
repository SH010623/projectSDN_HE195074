import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService, type BookingResponse } from "../services/bookingService";

export default function SePayPayment({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const [data, setData] = useState<BookingResponse | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await bookingService.getBookingById(bookingId);
        if (stopped) return;
        setData(response);
        setError("");
        if (response.booking.status !== "pending") return;
      } catch {
        if (stopped) return;
        setError("Chưa kiểm tra được thanh toán. Hệ thống sẽ thử lại; đừng chuyển tiền lần nữa.");
      }
      if (!stopped) timer = setTimeout(poll, 3000);
    };
    void poll();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { stopped = true; clearTimeout(timer); clearInterval(clock); };
  }, [bookingId]);

  const cancel = async () => {
    if (!window.confirm("Chỉ hủy nếu bạn chưa chuyển tiền. Bạn muốn hủy đơn này?")) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(bookingId);
      setData(await bookingService.getBookingById(bookingId));
    } catch {
      setError("Chưa hủy được đơn. Vui lòng kiểm tra trạng thái trước khi thử lại.");
    } finally { setCancelling(false); }
  };
  const booking = data?.booking;
  const payment = data?.payment;
  const remaining = Math.max(0, Math.ceil((new Date(booking?.expiresAt || 0).getTime() - now) / 1000));
  const paid = booking?.status === "confirmed" && booking.paymentStatus === "paid";
  const review = booking?.paymentStatus === "review";
  const pending = booking?.status === "pending" && !review;

  return <div className="w-full text-center text-white">
    <h3 className="text-xl font-bold mb-3">{paid ? "Đặt vé thành công!" : review ? "Giao dịch cần đối soát" : pending ? "Quét QR để thanh toán" : booking ? "Đơn đã đóng" : "Đang tải thanh toán…"}</h3>
    {booking && <p className="text-sm text-gray-300 mb-3">Mã đơn: <strong>{booking.bookingCode}</strong></p>}
    {error && <p role="alert" className="text-sm text-amber-300 mb-3">{error}</p>}
    {paid && <p role="status" className="text-sm text-emerald-300 mb-5">Đã nhận thanh toán {booking.finalPrice.toLocaleString("vi-VN")} ₫. Vé đã được xác nhận; email xác nhận sẽ được gửi đến tài khoản của bạn.</p>}
    {review && <p role="status" className="text-sm text-amber-300 mb-5">Đã ghi nhận giao dịch nhưng chưa cấp vé tự động. Vui lòng liên hệ rạp và cung cấp mã đơn để đối soát/hoàn tiền. Không chuyển thêm tiền.</p>}
    {pending && payment && remaining > 0 && <>
      <img src={payment.qrUrl} alt="QR chuyển khoản thanh toán vé" className="mx-auto w-56 h-56 object-contain bg-white rounded-lg mb-3" />
      <dl className="text-left text-sm space-y-2 bg-black/20 rounded-lg p-4 mb-3">
        <div><dt className="inline text-gray-400">Ngân hàng: </dt><dd className="inline">{payment.bank}</dd></div>
        <div><dt className="inline text-gray-400">Số tài khoản: </dt><dd className="inline select-all font-semibold">{payment.accountNumber}</dd></div>
        {payment.accountName && <div><dt className="inline text-gray-400">Chủ tài khoản: </dt><dd className="inline">{payment.accountName}</dd></div>}
        <div><dt className="inline text-gray-400">Số tiền: </dt><dd className="inline font-bold">{payment.amount.toLocaleString("vi-VN")} ₫</dd></div>
        <div><dt className="inline text-gray-400">Nội dung: </dt><dd className="inline select-all font-bold">{payment.content}</dd></div>
      </dl>
      <p className="text-sm text-amber-300 mb-2">Giữ ghế: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>
      <p className="text-xs text-gray-400 mb-4">Chuyển đúng số tiền và nội dung. Trang tự cập nhật khi ngân hàng báo tiền vào. Không chuyển khoản nhiều lần.</p>
    </>}
    {pending && remaining === 0 && <p className="text-sm text-amber-300 mb-4">Đã hết thời gian chuyển khoản. Đang kiểm tra trạng thái cuối cùng; vui lòng không chuyển thêm tiền.</p>}
    {booking && !pending && !paid && !review && <p className="text-sm text-gray-400 mb-4">Đơn {booking.status === "expired" ? "đã hết hạn" : "đã hủy"}. Nếu bạn đã chuyển khoản, vui lòng liên hệ rạp kèm mã đơn để đối soát. Không thanh toán tiếp cho đơn này.</p>}
    <div className="flex flex-wrap gap-3 justify-center">
      <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-sm">Đóng</button>
      {pending && <button onClick={cancel} disabled={cancelling} className="px-4 py-2 rounded-lg bg-white/10 text-sm disabled:opacity-50">{cancelling ? "Đang hủy…" : "Hủy đơn chưa chuyển tiền"}</button>}
      <button onClick={() => navigate("/my-tickets")} className="px-4 py-2 rounded-lg bg-[#e8173a] text-sm">Vé của tôi</button>
    </div>
  </div>;
}
