const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: [true, "Room name is required"],
        unique: true,
        trim: true,
    },
    roomType: {
        type: String,
        enum: ["2D", "3D", "IMAX", "4DX", "VIP"],
        default: "2D",
    },
    totalSeats: {
        type: Number,
        required: [true, "Total seats is required"],
        min: [1, "Total seats must be at least 1"],
    },
    rows: {
        type: Number,
        default: 5,
        min: [1, "Rows must be at least 1"],
    },
    seatsPerRow: {
        type: Number,
        default: 10,
        min: [1, "Seats per row must be at least 1"],
    },
    status: {
        type: String,
        enum: ["active", "inactive", "maintenance"],
        default: "active",
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
