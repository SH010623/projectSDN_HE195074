const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Room = require("./models/room.model");
const Movie = require("./models/movie.model");
const Showtime = require("./models/showtime.model");
const cinemaDate = require("./utils/cinemaDate");

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
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    let rooms = await Room.find({ status: "active" }).sort({ name: 1 });
    if (!rooms.length) {
      for (const room of sampleRooms) {
        await Room.updateOne({ name: room.name }, { $setOnInsert: room }, { upsert: true });
      }
      rooms = await Room.find({ status: "active" }).sort({ name: 1 });
      if (!rooms.length) rooms = [await Room.create({ ...sampleRooms[0], name: `Phòng demo ${Date.now()}` })];
    }
    let movies = await Movie.find({ status: "now_showing" }).sort({ title: 1 });
    if (!movies.length) {
      movies = [await Movie.create({
        title: "Cinema Demo - Hành trình khám phá", titleEn: "Cinema Demo",
        duration: 100, rating: "P", genres: ["Phiêu Lưu"],
        description: "Phim mẫu dùng thử lịch chiếu và đặt vé Cinema.",
        releaseDate: new Date(), status: "now_showing",
      })];
    }
    const now = new Date();
    const today = cinemaDate(now);
    const midnight = new Date(`${today}T00:00:00+07:00`);
    const slots = [
      { hour: 9, minute: 30, price: 75000 },
      { hour: 12, minute: 15, price: 85000 },
      { hour: 15, minute: 0, price: 85000 },
      { hour: 17, minute: 45, price: 90000 },
      { hour: 20, minute: 30, price: 95000 },
      { hour: 22, minute: 45, price: 80000 },
    ];
    let inserted = 0;
    let skipped = 0;
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayStart = new Date(midnight.getTime() + dayOffset * 86400000);
      const date = cinemaDate(dayStart);
      for (let roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
        const room = rooms[roomIdx];
        for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
          const slot = slots[slotIdx];
          const start = new Date(dayStart.getTime() + (slot.hour * 60 + slot.minute) * 60000);
          if (start.getTime() <= now.getTime() + 15 * 60000) continue;
          const movie = movies[(roomIdx + slotIdx + dayOffset) % movies.length];
          if (movie.releaseDate && movie.releaseDate > start) continue;
          if (movie.endDate && cinemaDate(movie.endDate) < date) continue;
          const end = new Date(start.getTime() + ((movie.duration || 110) + 15) * 60000);
          const conflict = await Showtime.exists({ roomId: room._id, status: { $ne: "cancelled" },
            startTime: { $lt: end }, endTime: { $gt: start },
          });
          if (conflict) { skipped++; continue; }
          const surcharge = { IMAX: 35000, "3D": 15000, VIP: 50000 }[room.roomType] || 0;
          await Showtime.create({ movieId: movie._id, roomId: room._id,
            startTime: start, endTime: end, date, price: slot.price + surcharge, status: "opened",
          });
          inserted++;
        }
      }
    }
    const until = new Date(midnight.getTime() + 7 * 86400000);
    const available = await Showtime.countDocuments({ roomId: { $in: rooms.map(room => room._id) },
      movieId: { $in: movies.map(movie => movie._id) }, status: { $in: ["opened", "scheduled"] },
      startTime: { $gt: now, $lt: until },
    });
    console.log(JSON.stringify({ added: inserted, skippedOverlapping: skipped, available,
      activeRooms: rooms.length, movies: movies.length, from: today,
      through: cinemaDate(new Date(until.getTime() - 1)), timeZone: "Asia/Ho_Chi_Minh",
    }, null, 2));
  } catch (error) {
    console.error("Không thể bổ sung lịch chiếu. Kiểm tra kết nối MongoDB.", { code: error.code || error.name });
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
