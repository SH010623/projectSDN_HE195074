const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Movie = require("./models/movie.model");


const sampleMovies = [
  {
    title: "Chị Em Thanh Tra 3",
    titleEn: "Inspector Sisters 3",
    genres: ["Hành Động", "Hài"],
    rating: "T16",
    duration: 120,
    releaseDate: new Date("2026-10-10"),
    director: "Nguyễn Hữu Hoàng",
    cast: ["Chi Pu", "Kỳ Duyên", "Steven Nguyễn", "Will Vũ"],
    description:
      "Phần tiếp theo của loạt phim hành động hài hước đình đám, hai chị em thanh tra tiếp tục phá án với những tình huống dở khóc dở cười.",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #1a0a2e 0%, #3d1155 50%, #6b21a8 100%)",
    bannerColor: "linear-gradient(135deg, #0d0720 0%, #1e0a3c 40%, #4c1d95 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "now_showing",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
  },
  {
    title: "Lật Mặt 8",
    titleEn: "Face Off 8",
    genres: ["Hành Động", "Tâm Lý"],
    rating: "T18",
    duration: 135,
    releaseDate: new Date("2026-10-15"),
    director: "Lý Hải",
    cast: ["Lý Hải", "Minh Hà", "Quang Tuấn"],
    description:
      "Hành trình trở về quê hương đầy bí ẩn, những sự thật bị che giấu lâu năm dần được hé lộ trong màn đối đầu kịch tính.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)",
    bannerColor: "linear-gradient(135deg, #060e1f 0%, #0c1e3d 40%, #1e3a5f 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "now_showing",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
  },
  {
    title: "Ma Da",
    titleEn: "Water Ghost",
    genres: ["Kinh Dị", "Bí Ẩn"],
    rating: "T18",
    duration: 110,
    releaseDate: new Date("2026-10-25"),
    director: "Trần Hữu Tấn",
    cast: ["Thanh Thuỷ", "Quang Tuấn", "Hoàng Yến Chibi"],
    description:
      "Câu chuyện kinh dị về vùng đất linh thiêng với những bí ẩn chưa được giải đáp, nơi ranh giới giữa người sống và người chết mờ nhạt.",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #0a1a1a 0%, #0d4040 50%, #047857 100%)",
    bannerColor: "linear-gradient(135deg, #051414 0%, #0a2929 40%, #0d3d3d 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "coming_soon",
    language: "Tiếng Việt - Phụ đề Tiếng Anh",
  },
  {
    title: "Nhà Bà Nữ",
    titleEn: "Mrs. Nu's House",
    genres: ["Hài", "Gia Đình"],
    rating: "P",
    duration: 100,
    releaseDate: new Date("2026-11-01"),
    director: "Trấn Thành",
    cast: ["Trấn Thành", "Nhã Phương", "Cát Phượng"],
    description:
      "Câu chuyện hài hước về một gia đình đặc biệt với bà Nữ cá tính, mang đến tiếng cười và bài học ý nghĩa về tình thân.",
    poster: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #1a0a0a 0%, #7c2020 50%, #dc2626 100%)",
    bannerColor: "linear-gradient(135deg, #0f0606 0%, #2d0e0e 40%, #6b1010 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "coming_soon",
    language: "Tiếng Việt",
  },
  {
    title: "Avengers: Doomsday",
    titleEn: "Avengers: Doomsday",
    genres: ["Hành Động", "Sci-Fi"],
    rating: "T13",
    duration: 160,
    releaseDate: new Date("2026-11-05"),
    director: "Russo Brothers",
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
    description:
      "Trận chiến cuối cùng của các siêu anh hùng trước ngày tận thế, khi kẻ thù mạnh nhất từ trước đến nay xuất hiện và đe dọa toàn vũ trụ.",
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #0a0a1a 0%, #1e1e4a 50%, #3730a3 100%)",
    bannerColor: "linear-gradient(135deg, #060610 0%, #111130 40%, #1e1e4a 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "coming_soon",
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
  },
  {
    title: "Kho Báu Rồng Biển",
    titleEn: "Dragon's Treasure",
    genres: ["Phiêu Lưu", "Gia Đình"],
    rating: "P",
    duration: 95,
    releaseDate: new Date("2026-10-20"),
    director: "Võ Thanh Hoà",
    cast: ["Trung Dân", "Khả Như", "Quang Trung"],
    description:
      "Cuộc phiêu lưu kỳ thú của ba người bạn tìm kiếm kho báu bí ẩn dưới đáy đại dương với những con rồng biển huyền thoại.",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    posterColor: "linear-gradient(145deg, #071a3a 0%, #0c3060 50%, #0284c7 100%)",
    bannerColor: "linear-gradient(135deg, #030d1e 0%, #081d3a 40%, #0c3060 100%)",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: "now_showing",
    language: "Tiếng Việt",
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // Xoá các phim cũ nếu cần hoặc kiểm tra
    try {
      await Movie.collection.dropIndexes();
      console.log("Dropped old indexes successfully");
    } catch (e) {
      // ignore if collection didn't exist
    }

    const existing = await Movie.countDocuments();
    if (existing > 0) {
      console.log(`Đã có ${existing} phim trong DB. Đang làm mới dữ liệu...`);
      await Movie.deleteMany({});
    }


    const inserted = await Movie.insertMany(sampleMovies);
    console.log(`✅ Seed thành công ${inserted.length} phim vào MongoDB!`);

    inserted.forEach((m, idx) => {
      console.log(`  ${idx + 1}. [${m.rating}] ${m.title} (${m.duration} phút) - ${m.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed thất bại:", error);
    process.exit(1);
  }
}

seed();
