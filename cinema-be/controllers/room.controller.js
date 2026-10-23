const db = require("../models");

// GET /rooms – Lấy danh sách phòng chiếu
// Khách/User chỉ thấy phòng 'active'. Admin có thể xem tất cả (hoặc lọc theo ?status=)
const getAllRooms = async (req, res) => {
  try {
    const { status, roomType, activeOnly } = req.query;

    const query = {};

    // Nếu yêu cầu chỉ lấy phòng active hoặc người dùng không phải admin
    const isAdmin = req.role === "admin";
    if (!isAdmin || activeOnly === "true") {
      query.status = "active";
    } else if (status && ["active", "inactive", "maintenance"].includes(status)) {
      query.status = status;
    }

    if (roomType) {
      query.roomType = roomType;
    }

    const rooms = await db.Room.find(query).sort({ name: 1 });

    return res.status(200).json({
      message: "Lấy danh sách phòng chiếu thành công",
      total: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /rooms/:id – Chi tiết 1 phòng chiếu
const getRoomById = async (req, res) => {
  try {
    const room = await db.Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }

    return res.status(200).json({
      message: "Lấy thông tin phòng chiếu thành công",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /rooms – Tạo phòng chiếu mới (Admin only)
const createRoom = async (req, res) => {
  try {
    const { name, roomType, totalSeats, rows, seatsPerRow, description } = req.body;

    if (!name || !totalSeats) {
      return res.status(400).json({
        message: "Tên phòng chiếu (name) và tổng số ghế (totalSeats) là bắt buộc",
      });
    }

    // Kiểm tra tên phòng đã tồn tại chưa
    const existingRoom = await db.Room.findOne({ name: name.trim() });
    if (existingRoom) {
      return res.status(409).json({ message: "Tên phòng chiếu này đã tồn tại" });
    }

    const calculatedSeats = rows && seatsPerRow ? rows * seatsPerRow : totalSeats;

    const newRoom = new db.Room({
      name: name.trim(),
      roomType: roomType || "2D",
      totalSeats: Number(calculatedSeats),
      rows: rows ? Number(rows) : 5,
      seatsPerRow: seatsPerRow ? Number(seatsPerRow) : 10,
      status: "active",
      description: description || "",
    });

    await newRoom.save();

    return res.status(201).json({
      message: "Tạo phòng chiếu mới thành công",
      room: newRoom,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /rooms/:id – Cập nhật thông tin phòng chiếu (Admin only)
const updateRoom = async (req, res) => {
  try {
    const { name, roomType, totalSeats, rows, seatsPerRow, description } = req.body;

    const room = await db.Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }

    // Nếu đổi tên, kiểm tra xem tên mới có bị trùng không
    if (name && name.trim() !== room.name) {
      const existing = await db.Room.findOne({ name: name.trim() });
      if (existing) {
        return res.status(409).json({ message: "Tên phòng chiếu này đã tồn tại" });
      }
      room.name = name.trim();
    }

    if (roomType) room.roomType = roomType;
    if (rows) room.rows = Number(rows);
    if (seatsPerRow) room.seatsPerRow = Number(seatsPerRow);

    if (totalSeats) {
      room.totalSeats = Number(totalSeats);
    } else if (rows && seatsPerRow) {
      room.totalSeats = Number(rows) * Number(seatsPerRow);
    }

    if (description !== undefined) room.description = description.trim();
    room.updatedAt = new Date();

    await room.save();

    return res.status(200).json({
      message: "Cập nhật phòng chiếu thành công",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /rooms/:id/status – Đổi trạng thái phòng chiếu (Soft Delete / Inactive / Maintenance) (Admin only)
const updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "inactive", "maintenance"].includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ! Chỉ chấp nhận: 'active', 'inactive', 'maintenance'",
      });
    }

    const room = await db.Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
    }

    room.status = status;
    room.updatedAt = new Date();
    await room.save();

    const statusMessages = {
      active: "Phòng chiếu đã được kích hoạt lại (Active)",
      inactive: "Phòng chiếu đã được chuyển sang ngừng hoạt động (Inactive)",
      maintenance: "Phòng chiếu đã được chuyển sang bảo trì (Maintenance)",
    };

    return res.status(200).json({
      message: statusMessages[status] || "Cập nhật trạng thái phòng chiếu thành công",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
};
