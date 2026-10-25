const db = require("../models");

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

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
};

