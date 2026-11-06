function bookingUnavailableReason(showtime, now = Date.now()) {
  if (!["scheduled", "opened"].includes(showtime.status)) return "Suất chiếu đã đóng hoặc đã hủy, không thể đặt vé";
  const start = new Date(showtime.startTime).getTime();
  if (!Number.isFinite(start) || start <= now) return "Suất chiếu đã bắt đầu hoặc đã quá hạn đặt vé";
  if (!showtime.movieId || showtime.movieId.status === "ended") return "Phim đã ngừng chiếu";
  if (!showtime.roomId || showtime.roomId.status !== "active") return "Phòng chiếu hiện không hoạt động";
  return null;
}
module.exports = bookingUnavailableReason;
