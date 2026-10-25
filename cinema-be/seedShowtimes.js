const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Room = require("./models/room.model");
const Movie = require("./models/movie.model");
const Showtime = require("./models/showtime.model");

const sampleRooms = [
  {
    name: "Hall 1 - Standard",
    roomType: "2D",
    totalSeats: 60,
    rows: 6,
    seatsPerRow: 10,
    status: "active",
    description: "Standard 2D Hall with Dolby 7.1 Surround Sound",
  },
  {
    name: "Hall 2 - 3D Digital",
    roomType: "3D",
    totalSeats: 70,
    rows: 7,
    seatsPerRow: 10,
    status: "active",
    description: "Digital 3D Hall with high brightness laser projection",
  },
  {
    name: "Hall 3 - IMAX Laser",
    roomType: "IMAX",
    totalSeats: 80,
    rows: 8,
    seatsPerRow: 10,
    status: "active",
    description: "IMAX Laser Experience with 12-channel audio",
  },
  {
    name: "VIP Lounge",
    roomType: "VIP",
    totalSeats: 30,
    rows: 5,
    seatsPerRow: 6,
    status: "active",
    description: "Luxury leather recliners with free beverages",
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    // 1. Ensure rooms exist
    let rooms = await Room.find();
    if (rooms.length < 3) {
      console.log("Adding standard cinema halls...");
      for (const r of sampleRooms) {
        const found = await Room.findOne({ name: r.name });
        if (!found) {
          await Room.create(r);
        }
      }
      rooms = await Room.find({ status: "active" });
    }
    console.log(`Active rooms: ${rooms.length}`);

    // 2. Fetch movies
    const movies = await Movie.find({ status: { $ne: "ended" } });
    if (movies.length === 0) {
      console.log("No movies found! Please seed movies first.");
      process.exit(1);
    }

    // 3. Clean old showtimes and create fresh ones
    await Showtime.deleteMany({});
    console.log("Cleared existing showtimes.");

    const nowShowingMovies = movies.filter((m) => m.status === "now_showing");
    const targetMovies = nowShowingMovies.length > 0 ? nowShowingMovies : movies;

    const days = [0, 1, 2]; // Today, Tomorrow, Day after tomorrow
    const timeSlots = [
      { hour: 9, minute: 30, price: 75000 },
      { hour: 13, minute: 0, price: 85000 },
      { hour: 16, minute: 30, price: 90000 },
      { hour: 20, minute: 0, price: 95000 },
    ];

    const showtimesToInsert = [];

    for (const dayOffset of days) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayOffset);
      const dateStr = baseDate.toISOString().split("T")[0];

      rooms.forEach((room, roomIndex) => {
        timeSlots.forEach((slot, slotIndex) => {
          // Rotate movies evenly across rooms and slots
          const movie = targetMovies[(roomIndex + slotIndex + dayOffset) % targetMovies.length];
          const start = new Date(baseDate);
          start.setHours(slot.hour, slot.minute, 0, 0);

          const duration = movie.duration || 120;
          const end = new Date(start.getTime() + (duration + 15) * 60 * 1000);

          // Extra pricing for IMAX / VIP
          let price = slot.price;
          if (room.roomType === "IMAX") price += 35000;
          if (room.roomType === "3D") price += 15000;
          if (room.roomType === "VIP") price += 50000;

          showtimesToInsert.push({
            movieId: movie._id,
            roomId: room._id,
            startTime: start,
            endTime: end,
            date: dateStr,
            price,
            status: "opened",
          });
        });
      });
    }

    const inserted = await Showtime.insertMany(showtimesToInsert);
    console.log(`✅ Seeded ${inserted.length} showtimes successfully across ${rooms.length} rooms and ${days.length} days!`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed showtimes failed:", err);
    process.exit(1);
  }
}

seed();
