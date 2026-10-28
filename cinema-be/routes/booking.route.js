const express = require("express");
const {
  getOccupiedSeats,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require("../controllers/booking.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /bookings/showtime/:showtimeId/seats – Public / optional token to view seat layout and taken seats
router.get("/showtime/:showtimeId/seats", optionalVerifyToken, getOccupiedSeats);

// POST /bookings – Book tickets (User token required)
router.post("/", verifyToken, createBooking);

// GET /bookings/my-tickets – List my tickets (User token required)
router.get("/my-tickets", verifyToken, getMyBookings);

// GET /bookings/admin/all – Admin view all bookings
router.get("/admin/all", verifyToken, adminOnly, getAllBookings);

// GET /bookings/:id – Get details of 1 booking (Owner or Admin)
router.get("/:id", verifyToken, getBookingById);

// PATCH /bookings/:id/cancel – Cancel a booking
router.patch("/:id/cancel", verifyToken, cancelBooking);

module.exports = router;
