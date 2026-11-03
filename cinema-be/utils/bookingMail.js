const { sendMail } = require("./mail");

exports.sendBookingConfirmation = async (booking) => {
  if (!booking?.userId?.email) throw new Error("Booking email is unavailable");
  const { userId: user, showtimeId: showtime } = booking;
  const startTime = new Date(showtime.startTime).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "full",
    timeStyle: "short",
  });
  const money = (value) => new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND",
  }).format(value);

  return sendMail({
    to: user.email,
    subject: `Cinema - Xác nhận đặt vé ${booking.bookingCode}`,
    text: [
      `Xin chào ${user.name || "bạn"},`,
      "Bạn đã đặt vé và thanh toán thành công!",
      "",
      `Mã đặt vé: ${booking.bookingCode}`,
      `Phim: ${showtime.movieId.title}`,
      `Phòng chiếu: ${showtime.roomId.name}`,
      `Suất chiếu: ${startTime} (giờ Việt Nam)`,
      `Ghế: ${booking.seats.join(", ")}`,
      `Tổng tiền vé: ${money(booking.totalPrice)}`,
      `Giảm giá: ${money(booking.discountAmount || 0)}`,
      `Đã thanh toán: ${money(booking.finalPrice)}`,
      "",
      "Vui lòng cung cấp mã đặt vé khi đến rạp. Bạn có thể xem lại vé tại mục Vé của tôi.",
      "Chúc bạn có buổi xem phim vui vẻ!",
    ].join("\n"),
  });
};
