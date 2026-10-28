const mongoose = require("mongoose");
const User = require("./user.model");
const Room = require("./room.model");
const Movie = require("./movie.model");
const Showtime = require("./showtime.model");
const News = require("./news.model");
const Voucher = require("./voucher.model");
const Booking = require("./booking.model");

const db = {};

// Define schema
db.User = User;
db.Room = Room;
db.Movie = Movie;
db.Showtime = Showtime;
db.News = News;
db.Voucher = Voucher;
db.Booking = Booking;

module.exports = db;