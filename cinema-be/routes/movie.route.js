const express = require("express");
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
} = require("../controllers/movie.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /movies – Danh sách phim (Công khai, khách xem phim now_showing và coming_soon, admin xem all)
router.get("/", optionalVerifyToken, getAllMovies);

// GET /movies/:id – Chi tiết 1 phim
router.get("/:id", getMovieById);


// POST /movies – Thêm phim mới (Admin only)
router.post("/", verifyToken, adminOnly, createMovie);

// PUT /movies/:id – Cập nhật phim (Admin only)
router.put("/:id", verifyToken, adminOnly, updateMovie);

// DELETE /movies/:id – Xoá phim (Admin only)
router.delete("/:id", verifyToken, adminOnly, deleteMovie);

// PATCH /movies/:id/status – Đổi trạng thái phim (Admin only)
router.patch("/:id/status", verifyToken, adminOnly, updateMovieStatus);

module.exports = router;
