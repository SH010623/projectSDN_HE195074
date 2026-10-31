const express = require("express");
const authRoute = require("./auth.route");
const profileRoute = require("./profile.route");
const userRoute = require("./user.route");
const roomRoute = require("./room.route");
const movieRoute = require("./movie.route");
const showtimeRoute = require("./showtime.route");
const newsRoute = require("./news.route");
const voucherRoute = require("./voucher.route");
const bookingRoute = require("./booking.route");
const dashboardAdminRoute = require("./dashboardAdmin.route");
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAccessKey, userOnly } = require("../middlewares/verifyAccessKey");

const router = express.Router();

// ─── Gắn các nhóm route theo resource ───────────────────────────────────────
router.use("/", authRoute);              // /register, /login
router.use("/profile", profileRoute);    // /profile, /profile/change-password
router.use("/admin/users", userRoute);   // /admin/users, /admin/users/:id, /admin/users/:id/toggle-status
router.use("/rooms", roomRoute);         // /rooms, /rooms/:id, /rooms/:id/status
router.use("/movies", movieRoute);       // /movies, /movies/:id
router.use("/showtimes", showtimeRoute); // /showtimes, /showtimes/:id
router.use("/news", newsRoute);          // /news, /news/:id
router.use("/vouchers", voucherRoute);   // /vouchers, /vouchers/:id, /vouchers/check
router.use("/bookings", bookingRoute);   // /bookings, /bookings/my-tickets, /bookings/showtime/:id/seats
router.use("/admin/dashboard", dashboardAdminRoute); // /admin/dashboard/stats



// ─── Route Test / Legacy ────────────────────────────────────────────────────
router.get("/protected", verifyToken, async (req, res) => {
  res.status(200).json({
    message: "This is a protected route",
    user: {
      userId: req.userId,
      role: req.role,
    },
  });
});

router.get("/protected-key", verifyAccessKey, userOnly, async (req, res) => {
  res.status(200).json({
    message: "This is a protected route (access_key)",
    user: {
      userId: req.userId,
      name: req.user.name,
      role: req.role,
      user: req.user,
    },
  });
});

module.exports = router;
