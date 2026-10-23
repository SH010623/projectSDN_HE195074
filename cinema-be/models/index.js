const mongoose = require("mongoose");
const User = require("./user.model");
const Room = require("./room.model");

const db = {};

// Define schema
db.User = User;
db.Room = Room;

module.exports = db;