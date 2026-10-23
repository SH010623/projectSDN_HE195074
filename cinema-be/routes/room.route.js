const express = require("express");
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
} = require("../controllers/room.controller");
const {
  verifyToken,
  adminOnly,
  optionalVerifyToken,
} = require("../middlewares/verifyToken");

const router = express.Router();

// GET /rooms – Lấy danh sách phòng (Khách chỉ thấy active, Admin thấy tất cả)
router.get("/", optionalVerifyToken, getAllRooms);

// GET /rooms/:id – Chi tiết 1 phòng
router.get("/:id", getRoomById);

// POST /rooms – Tạo phòng mới (Admin)
router.post("/", verifyToken, adminOnly, createRoom);

// PUT /rooms/:id – Sửa thông tin phòng (Admin)
router.put("/:id", verifyToken, adminOnly, updateRoom);

// PATCH /rooms/:id/status – Đổi trạng thái phòng (active / inactive / maintenance) (Admin)
router.patch("/:id/status", verifyToken, adminOnly, updateRoomStatus);

module.exports = router;
