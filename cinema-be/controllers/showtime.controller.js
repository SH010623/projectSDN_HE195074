const db = require("../models");
const cinemaDate = require("../utils/cinemaDate");

// GET /showtimes – Fetch showtimes list with filters (movieId, roomId, date, status)
const getAllShowtimes = async (req, res) => {
  try {
    const { movieId, roomId, date, status } = req.query;

    const query = {};

    if (movieId) query.movieId = movieId;
    if (roomId) query.roomId = roomId;
    if (date) query.date = date;

    if (status && status !== "all") {
      query.status = status;
    } else if (!req.role || req.role !== "admin") {
      // Non-admin users only see non-cancelled showtimes
      query.status = { $ne: "cancelled" };
    }

    const showtimes = await db.Showtime.find(query)
      .populate("movieId", "title titleEn duration poster posterColor rating genres status")
      .populate("roomId", "name roomType totalSeats rows seatsPerRow status")
      .sort({ startTime: 1 });

    return res.status(200).json({
      message: "Lấy danh sách suất chiếu thành công",
      total: showtimes.length,
      showtimes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /showtimes/:id – Get details of a single showtime
const getShowtimeById = async (req, res) => {
  try {
    const showtime = await db.Showtime.findById(req.params.id)
      .populate("movieId")
      .populate("roomId");

    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    return res.status(200).json({
      message: "Lấy chi tiết suất chiếu thành công",
      showtime,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /showtimes – Create new showtime with room overlap conflict detection (Admin only)
const createShowtime = async (req, res) => {
  try {
    const { movieId, roomId, startTime, price = 80000, status = "scheduled" } = req.body;

    if (!movieId || !roomId || !startTime) {
      return res.status(400).json({
        message: "Phim (movieId), Phòng chiếu (roomId) và Giờ bắt đầu (startTime) là bắt buộc",
      });
    }

    // Verify Movie existence and status
    const movie = await db.Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Phim đã chọn không tồn tại" });
    }
    if (movie.status === "ended") {
      return res.status(400).json({ message: "Không thể tạo suất chiếu cho phim đã ngừng chiếu" });
    }

    // Verify Room existence and status
    const room = await db.Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Phòng chiếu không tồn tại" });
    }
    if (room.status !== "active") {
      return res.status(400).json({
        message: `Phòng chiếu "${room.name}" hiện đang ở trạng thái "${room.status}", không thể xếp lịch`,
      });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Định dạng thời gian bắt đầu không hợp lệ" });
    }

    // Auto-calculate end time: movie duration + 15 mins intermission & hall cleaning
    const durationMinutes = movie.duration || 120;
    const end = new Date(start.getTime() + (durationMinutes + 15) * 60 * 1000);

    // Extract date in YYYY-MM-DD
    const dateStr = cinemaDate(start);

    // Conflict detection: verify if another active showtime occupies the room during [start, end]
    const conflicting = await db.Showtime.findOne({
      roomId,
      status: { $ne: "cancelled" },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).populate("movieId", "title");

    if (conflicting) {
      const conflictStart = new Date(conflicting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const conflictEnd = new Date(conflicting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const conflictMovie = conflicting.movieId ? conflicting.movieId.title : "phim khác";
      return res.status(400).json({
        message: `Trùng lịch chiếu: Phòng "${room.name}" đã có suất chiếu phim "${conflictMovie}" từ ${conflictStart} đến ${conflictEnd}.`,
      });
    }

    const newShowtime = new db.Showtime({
      movieId,
      roomId,
      startTime: start,
      endTime: end,
      date: dateStr,
      price: Number(price) || 80000,
      status,
    });

    const saved = await newShowtime.save();
    const populated = await db.Showtime.findById(saved._id)
      .populate("movieId", "title titleEn duration poster rating genres")
      .populate("roomId", "name roomType totalSeats rows seatsPerRow");

    return res.status(201).json({
      message: "Tạo suất chiếu mới thành công",
      showtime: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /showtimes/:id – Update existing showtime (Admin only)
const updateShowtime = async (req, res) => {
  try {
    const { movieId, roomId, startTime, price, status } = req.body;

    const showtime = await db.Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    const targetMovieId = movieId || showtime.movieId;
    const targetRoomId = roomId || showtime.roomId;

    const movie = await db.Movie.findById(targetMovieId);
    if (!movie) {
      return res.status(404).json({ message: "Phim đã chọn không tồn tại" });
    }

    const room = await db.Room.findById(targetRoomId);
    if (!room) {
      return res.status(404).json({ message: "Phòng chiếu không tồn tại" });
    }

    const start = startTime ? new Date(startTime) : showtime.startTime;
    const durationMinutes = movie.duration || 120;
    const end = new Date(start.getTime() + (durationMinutes + 15) * 60 * 1000);
    const dateStr = cinemaDate(start);

    // Conflict detection excluding current showtime
    const conflicting = await db.Showtime.findOne({
      _id: { $ne: req.params.id },
      roomId: targetRoomId,
      status: { $ne: "cancelled" },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).populate("movieId", "title");

    if (conflicting) {
      const conflictStart = new Date(conflicting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const conflictEnd = new Date(conflicting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const conflictMovie = conflicting.movieId ? conflicting.movieId.title : "phim khác";
      return res.status(400).json({
        message: `Trùng lịch chiếu: Phòng "${room.name}" đã có suất chiếu phim "${conflictMovie}" từ ${conflictStart} đến ${conflictEnd}.`,
      });
    }

    showtime.movieId = targetMovieId;
    showtime.roomId = targetRoomId;
    showtime.startTime = start;
    showtime.endTime = end;
    showtime.date = dateStr;
    if (price !== undefined) showtime.price = Number(price);
    if (status !== undefined) showtime.status = status;

    await showtime.save();

    const populated = await db.Showtime.findById(showtime._id)
      .populate("movieId", "title titleEn duration poster rating genres")
      .populate("roomId", "name roomType totalSeats rows seatsPerRow");

    return res.status(200).json({
      message: "Cập nhật suất chiếu thành công",
      showtime: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /showtimes/:id – Delete showtime (Admin only)
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await db.Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu để xoá" });
    }

    return res.status(200).json({
      message: "Xoá suất chiếu thành công",
      deletedId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /showtimes/:id/status – Quick toggle showtime status (Admin only)
const updateShowtimeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["scheduled", "opened", "closed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ (scheduled, opened, closed, cancelled)",
      });
    }

    const showtime = await db.Showtime.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("movieId", "title duration")
      .populate("roomId", "name roomType");

    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái suất chiếu thành công",
      showtime,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  updateShowtimeStatus,
};
