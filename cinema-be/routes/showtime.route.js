const express = require("express");
const {
  getAllShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  updateShowtimeStatus,
} = require("../controllers/showtime.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /showtimes – Public list (filterable by movieId, roomId, date, status)
router.get("/", optionalVerifyToken, getAllShowtimes);

// GET /showtimes/:id – Details of 1 showtime
router.get("/:id", getShowtimeById);

// POST /showtimes – Create new showtime (Admin)
router.post("/", verifyToken, adminOnly, createShowtime);

// PUT /showtimes/:id – Update showtime (Admin)
router.put("/:id", verifyToken, adminOnly, updateShowtime);

// DELETE /showtimes/:id – Delete showtime (Admin)
router.delete("/:id", verifyToken, adminOnly, deleteShowtime);

// PATCH /showtimes/:id/status – Update showtime status (Admin)
router.patch("/:id/status", verifyToken, adminOnly, updateShowtimeStatus);

module.exports = router;
