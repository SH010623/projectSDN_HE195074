const db = require("../models");

// Dữ liệu phim mẫu để seed nhanh
const initialMovies = [
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

// GET /movies – Danh sách phim (Hỗ trợ lọc status, search, genre, phân trang)
const getAllMovies = async (req, res) => {
  try {
    const { status, genre, search, page = 1, limit = 0, sort = "-releaseDate" } = req.query;

    const query = {};

    // Nếu không phải admin và không chỉ định status, mặc định trả về phim đang chiếu và sắp chiếu
    const isAdmin = req.role === "admin";
    if (status && status !== "all") {
      query.status = status;
    } else if (!isAdmin && (!status || status === "all")) {
      query.status = { $in: ["now_showing", "coming_soon"] };
    }

    if (genre) {
      query.genres = { $in: [new RegExp(genre, "i")] };
    }

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { titleEn: regex }, { director: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0;
    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    let moviesQuery = db.Movie.find(query).sort(sort);
    if (limitNum > 0) {
      moviesQuery = moviesQuery.skip(skip).limit(limitNum);
    }

    const [movies, total] = await Promise.all([
      moviesQuery.exec(),
      db.Movie.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách phim thành công",
      total,
      currentPage: pageNum,
      totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      movies,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /movies/:id – Lấy chi tiết 1 phim
const getMovieById = async (req, res) => {
  try {
    const movie = await db.Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim này" });
    }

    return res.status(200).json({
      message: "Lấy thông tin phim thành công",
      movie,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /movies – Tạo mới phim (Admin)
const createMovie = async (req, res) => {
  try {
    const {
      title,
      titleEn,
      genres,
      rating,
      duration,
      releaseDate,
      endDate,
      director,
      cast,
      description,
      poster,
      banner,
      posterColor,
      bannerColor,
      trailerUrl,
      language,
      status,
    } = req.body;

    if (!title || !duration || !releaseDate) {
      return res.status(400).json({
        message: "Tên phim (title), thời lượng (duration) và ngày khởi chiếu (releaseDate) là bắt buộc",
      });
    }

    // Xử lý genres và cast nếu truyền vào dạng chuỗi phân tách bởi dấu phẩy
    const parsedGenres = Array.isArray(genres)
      ? genres
      : typeof genres === "string"
      ? genres.split(",").map((g) => g.trim()).filter(Boolean)
      : [];

    const parsedCast = Array.isArray(cast)
      ? cast
      : typeof cast === "string"
      ? cast.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const newMovie = new db.Movie({
      title: title.trim(),
      titleEn: titleEn ? titleEn.trim() : "",
      genres: parsedGenres,
      rating: rating || "P",
      duration: Number(duration),
      releaseDate: new Date(releaseDate),
      endDate: endDate ? new Date(endDate) : undefined,
      director: director ? director.trim() : "",
      cast: parsedCast,
      description: description ? description.trim() : "",
      poster: poster ? poster.trim() : "",
      banner: banner ? banner.trim() : "",
      posterColor: posterColor || undefined,
      bannerColor: bannerColor || undefined,
      trailerUrl: trailerUrl ? trailerUrl.trim() : "",
      language: language || "Tiếng Việt - Phụ đề Tiếng Anh",
      status: status || "now_showing",
    });

    const savedMovie = await newMovie.save();

    return res.status(201).json({
      message: "Thêm phim mới thành công",
      movie: savedMovie,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /movies/:id – Cập nhật phim (Admin)
const updateMovie = async (req, res) => {
  try {
    const {
      title,
      titleEn,
      genres,
      rating,
      duration,
      releaseDate,
      endDate,
      director,
      cast,
      description,
      poster,
      banner,
      posterColor,
      bannerColor,
      trailerUrl,
      language,
      status,
    } = req.body;

    const movie = await db.Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim cần cập nhật" });
    }

    if (title) movie.title = title.trim();
    if (titleEn !== undefined) movie.titleEn = titleEn.trim();
    if (genres !== undefined) {
      movie.genres = Array.isArray(genres)
        ? genres
        : typeof genres === "string"
        ? genres.split(",").map((g) => g.trim()).filter(Boolean)
        : [];
    }
    if (rating) movie.rating = rating;
    if (duration) movie.duration = Number(duration);
    if (releaseDate) movie.releaseDate = new Date(releaseDate);
    if (endDate !== undefined) movie.endDate = endDate ? new Date(endDate) : undefined;
    if (director !== undefined) movie.director = director.trim();
    if (cast !== undefined) {
      movie.cast = Array.isArray(cast)
        ? cast
        : typeof cast === "string"
        ? cast.split(",").map((c) => c.trim()).filter(Boolean)
        : [];
    }
    if (description !== undefined) movie.description = description.trim();
    if (poster !== undefined) movie.poster = poster.trim();
    if (banner !== undefined) movie.banner = banner.trim();
    if (posterColor !== undefined) movie.posterColor = posterColor;
    if (bannerColor !== undefined) movie.bannerColor = bannerColor;
    if (trailerUrl !== undefined) movie.trailerUrl = trailerUrl.trim();
    if (language !== undefined) movie.language = language.trim();
    if (status) movie.status = status;

    const updatedMovie = await movie.save();

    return res.status(200).json({
      message: "Cập nhật thông tin phim thành công",
      movie: updatedMovie,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /movies/:id – Xoá phim (Admin)
const deleteMovie = async (req, res) => {
  try {
    const movie = await db.Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim để xoá" });
    }

    return res.status(200).json({
      message: "Xoá phim thành công",
      deletedId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /movies/:id/status – Đổi trạng thái phim nhanh (Admin)
const updateMovieStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["now_showing", "coming_soon", "ended"].includes(status)) {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ! (now_showing, coming_soon, ended)",
      });
    }

    const movie = await db.Movie.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái phim thành công",
      movie,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /movies/seed – Nạp dữ liệu phim mẫu ban đầu (Nếu chưa có dữ liệu)
const seedSampleMovies = async (req, res) => {
  try {
    const count = await db.Movie.countDocuments();
    if (count > 0 && req.query.force !== "true") {
      return res.status(200).json({
        message: `Hệ thống đã có ${count} phim. Dùng ?force=true nếu muốn xóa và nạp lại.`,
        count,
      });
    }

    if (req.query.force === "true") {
      await db.Movie.deleteMany({});
    }

    const created = await db.Movie.insertMany(initialMovies);

    return res.status(201).json({
      message: `Đã nạp thành công ${created.length} phim mẫu vào hệ thống!`,
      count: created.length,
      movies: created,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
  seedSampleMovies,
};
