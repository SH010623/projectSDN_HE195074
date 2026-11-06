import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { movies as initialMockMovies } from "../data/movies";
import { movieService } from "../services/movieService";
import type { Movie as ApiMovie } from "../services/movieService";

// Sub-components
import type { UiMovie } from "../components/home/types";
import Navbar from "../components/home/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import MovieSection from "../components/home/MovieSection";
import NewsSection from "../components/home/NewsSection";
import PromotionsSection from "../components/home/PromotionsSection";
import Footer from "../components/home/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

type ModalState = "none" | "login" | "register" | "forgotPassword";

export default function HomePage({ scheduleOnly = false }: { scheduleOnly?: boolean }) {
  const navigate = useNavigate();

  // Authentication modals state
  const [modal, setModal] = useState<ModalState>("none");

  // Hero carousel and movie tab state
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon">("now-showing");
  const [movieList, setMovieList] = useState<UiMovie[]>(initialMockMovies);

  // Current logged in user info from localStorage
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  // Load movies from backend on initial mount
  useEffect(() => {
    fetchMoviesFromBackend();
  }, []);

  // Fetch movies from API with fallback to initial mock data
  const fetchMoviesFromBackend = async () => {
    try {
      const res = await movieService.getMovies({ status: "all" });
      if (res.movies && res.movies.length > 0) {
        const mapped: UiMovie[] = res.movies.filter((m: ApiMovie) => m.status !== "ended").map((m: ApiMovie) => ({
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

  const handleOpenShowtimes = (movie: UiMovie) => {
    navigate(`/movies/${movie.id}/showtimes`);
  };

  // Handle successful login
  const handleLoginSuccess = (loggedInUser?: any) => {
    setModal("none");
    if (loggedInUser?.role === "admin") {
      navigate("/dashboard");
    }
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
      {!scheduleOnly && <HeroBanner
        movieList={movieList}
        activeSlide={activeSlide}
        onSelectSlide={(idx) => setActiveSlide(idx)}
        onPrevSlide={() => setActiveSlide((s) => (s - 1 + movieList.length) % movieList.length)}
        onNextSlide={() => setActiveSlide((s) => (s + 1) % movieList.length)}
        onBookNow={handleOpenShowtimes}
      />}

      {/* ── 3. MOVIES SECTION ── */}
      {scheduleOnly && <div className="pt-32 px-6 max-w-[1280px] mx-auto"><h1 className="text-3xl font-bold">Lịch chiếu & Đặt vé</h1><p className="mt-3 text-gray-400">Chọn phim, ngày và suất chiếu để đặt vé.</p></div>}
      <MovieSection
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        movies={displayMovies}
        onSelectMovie={handleOpenShowtimes}
      />

      {/* ── 4. NEWS SECTION ── */}
      {!scheduleOnly && <NewsSection id="news" />}

      {/* ── 5. PROMOTIONS SECTION ── */}
      {!scheduleOnly && <PromotionsSection id="promotions" />}

      {/* ── 6. FOOTER ── */}
      <Footer />

      {/* ── 7. AUTH MODALS ── */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal("none")}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setModal("register")}
          onSwitchToForgotPassword={() => setModal("forgotPassword")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
      {modal === "forgotPassword" && (
        <ForgotPasswordModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  );
}
