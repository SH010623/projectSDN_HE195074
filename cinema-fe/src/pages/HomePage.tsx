import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { movies as initialMockMovies } from "../data/movies";
import { movieService } from "../services/movieService";
import type { Movie as ApiMovie } from "../services/movieService";
import { showtimeService } from "../services/showtimeService";
import type { Showtime } from "../services/showtimeService";

// Sub-components
import type { UiMovie } from "../components/home/types";
import Navbar from "../components/home/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import MovieSection from "../components/home/MovieSection";
import ShowtimeModal from "../components/home/ShowtimeModal";
import NewsSection from "../components/home/NewsSection";
import PromotionsSection from "../components/home/PromotionsSection";
import Footer from "../components/home/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

type ModalState = "none" | "login" | "register";

export default function HomePage() {
  const navigate = useNavigate();

  // Authentication modals state
  const [modal, setModal] = useState<ModalState>("none");

  // Hero carousel and movie tab state
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon">("now-showing");
  const [movieList, setMovieList] = useState<UiMovie[]>(initialMockMovies);

  // Showtime selection state
  const todayStr = new Date().toISOString().split("T")[0];
  const [bookingMovie, setBookingMovie] = useState<UiMovie | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [movieShowtimes, setMovieShowtimes] = useState<Showtime[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Current logged in user info from localStorage
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  // Load movies from backend on initial mount
  useEffect(() => {
    fetchMoviesFromBackend();
  }, []);

  // Fetch showtimes whenever a movie is selected or booking date changes
  useEffect(() => {
    if (bookingMovie && typeof bookingMovie.id === "string") {
      fetchShowtimesForBooking(bookingMovie.id, bookingDate);
    }
  }, [bookingMovie, bookingDate]);

  // Fetch movies from API with fallback to initial mock data
  const fetchMoviesFromBackend = async () => {
    try {
      const res = await movieService.getMovies({ status: "all" });
      if (res.movies && res.movies.length > 0) {
        const mapped: UiMovie[] = res.movies.map((m: ApiMovie) => ({
          id: m._id,
          title: m.title,
          titleEn: m.titleEn || "",
          genre: m.genres && m.genres.length > 0 ? m.genres : ["Điện Ảnh"],
          rating: m.rating || "P",
          duration: `${m.duration} phút`,
          releaseDate: m.releaseDate
            ? new Date(m.releaseDate).toLocaleDateString("vi-VN")
            : "Sắp chiếu",
          director: m.director || "",
          cast: m.cast || [],
          description: m.description || "",
          poster: m.poster,
          banner: m.banner,
          posterColor: m.posterColor || "linear-gradient(145deg, #1a0a2e 0%, #3d1155 50%, #6b21a8 100%)",
          bannerColor: m.bannerColor || "linear-gradient(135deg, #0d0720 0%, #1e0a3c 40%, #4c1d95 100%)",
          badge: m.status === "coming_soon" ? "coming-soon" : "now-showing",
          trailerUrl: m.trailerUrl,
        }));
        setMovieList(mapped);
      }
    } catch (err) {
      // Fallback gracefully to mock movies
    }
  };

  // Fetch showtimes for the selected movie and date
  const fetchShowtimesForBooking = async (movieId: string, date: string) => {
    try {
      setLoadingShowtimes(true);
      const res = await showtimeService.getShowtimes({ movieId, date });
      setMovieShowtimes(res.showtimes || []);
    } catch (err) {
      setMovieShowtimes([]);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  // Handle movie card click to open showtime modal
  const handleOpenShowtimes = (movie: UiMovie) => {
    setBookingMovie(movie);
  };

  // Handle selecting a specific showtime slot
  const handleSelectShowtime = (showtime: Showtime) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để tiến hành chọn ghế và đặt vé!");
      setModal("login");
      return;
    }

    const startTimeStr = new Date(showtime.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    alert(
      `Đã chọn suất chiếu lúc ${startTimeStr} (${showtime.roomId?.name} - ${showtime.roomId?.roomType}).\nLuồng Đặt vé & Chọn ghế (Luồng 3) sẽ kích hoạt tiếp theo!`
    );
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setModal("none");
    navigate("/dashboard");
  };

  // Filter movies by active tab
  const nowShowing = movieList.filter((m) => m.badge === "now-showing");
  const comingSoon = movieList.filter((m) => m.badge === "coming-soon");
  const displayMovies = activeTab === "now-showing" ? nowShowing : comingSoon;

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f0f0f5] font-inter">
      {/* ── 1. NAVBAR ── */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setModal("login")}
        onOpenRegister={() => setModal("register")}
        onGoToDashboard={() => navigate("/dashboard")}
      />

      {/* ── 2. HERO BANNER ── */}
      <HeroBanner
        movieList={movieList}
        activeSlide={activeSlide}
        onSelectSlide={(idx) => setActiveSlide(idx)}
        onPrevSlide={() => setActiveSlide((s) => (s - 1 + movieList.length) % movieList.length)}
        onNextSlide={() => setActiveSlide((s) => (s + 1) % movieList.length)}
        onBookNow={handleOpenShowtimes}
      />

      {/* ── 3. MOVIES SECTION ── */}
      <MovieSection
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        movies={displayMovies}
        onSelectMovie={handleOpenShowtimes}
      />

      {/* ── 4. NEWS SECTION ── */}
      <NewsSection id="news" />

      {/* ── 5. PROMOTIONS SECTION ── */}
      <PromotionsSection id="promotions" />

      {/* ── 6. FOOTER ── */}
      <Footer />

      {/* ── 6. SHOWTIME BOOKING MODAL ── */}
      {bookingMovie && (
        <ShowtimeModal
          movie={bookingMovie}
          selectedDate={bookingDate}
          onDateChange={(d) => setBookingDate(d)}
          showtimes={movieShowtimes}
          loading={loadingShowtimes}
          onClose={() => setBookingMovie(null)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}

      {/* ── 7. AUTH MODALS ── */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal("none")}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setModal("register")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  );
}
