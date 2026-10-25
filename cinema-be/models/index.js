const mongoose = require("mongoose");
const User = require("./user.model");
const Room = require("./room.model");
const Movie = require("./movie.model");

const db = {};

// Define schema
db.User = User;
db.Room = Room;
db.Movie = Movie;

module.exports = db;