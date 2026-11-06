const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const userSchema = new Schema({
    email: { type: String, required: [true, "Email is required"], unique: true },
    password: { type: String, required: [true, "Password is required"] },
    name: { type: String, required: [true, "Name is required"] },
    phone: { type: String },
    address: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    access_key: { type: String },
    isActive: { type: Boolean, default: true },
    resetOtpHash: { type: String, select: false },
    resetOtpExpiresAt: { type: Date, select: false },
    resetOtpSentAt: { type: Date, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;