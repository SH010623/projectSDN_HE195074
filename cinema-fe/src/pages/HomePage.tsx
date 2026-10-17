import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movies } from "../data/movies";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

type ModalState = "none" | "login" | "register";

export default function HomePage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>("none");
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon">("now-showing");

  const nowShowing = movies.filter((m) => m.badge === "now-showing");
  const comingSoon = movies.filter((m) => m.badge === "coming-soon");
  const displayMovies = activeTab === "now-showing" ? nowShowing : comingSoon;
  const heroMovie = movies[activeSlide];

  const handleLoginSuccess = () => {
    setModal("none");
    navigate("/dashboard");
  };

  const promos = [
    {
      id: "promo-1",
      label: "Thu 4 vui ve",
      desc: "Giam 30% tat ca ghe thuong vao moi thu 4 hang tuan.",
      bg: "from-[#1e1040] to-[#4c1d95]",
    },
    {
      id: "promo-2",
      label: "Combo gia dinh",
      desc: "2 ve nguoi lon + 2 ve tre em + 2 nuoc + 1 bap lon chi tu 350.000d.",
      bg: "from-[#1a0a14] to-[#7c1040]",
    },
    {
      id: "promo-3",
      label: "The thanh vien",
      desc: "Tich diem moi lan mua ve, doi qua tang hap dan tu 500 diem.",
      bg: "from-[#0a1a30] to-[#1d4ed8]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f0f0f5] font-inter">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a12]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <a href="/" id="navbar-logo" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-9 h-9 bg-[#e8173a] flex items-center justify-center rounded-md">
              <span className="text-white font-extrabold text-lg leading-none">N</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-[0.72rem] tracking-[0.1em]">NATIONAL</span>
              <span className="text-[#8888a0] text-[0.6rem] tracking-[0.08em]">CINEMA CENTER</span>
            </div>
          </a>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 flex-1">
            {[
              { id: "nav-home", label: "Trang chu", href: "/", active: true },
              { id: "nav-schedule", label: "Lich chieu", href: "#schedule" },
              { id: "nav-news", label: "Tin tuc", href: "#news" },
              { id: "nav-promotions", label: "Khuyen mai", href: "#promotions" },
              { id: "nav-tickets", label: "Gia ve", href: "#tickets" },
              { id: "nav-festival", label: "Lien hoan phim", href: "#festival" },
              { id: "nav-about", label: "Gioi thieu", href: "#about" },
            ].map((link) => (
              <a
                key={link.id}
                id={link.id}
                href={link.href}
                className={`px-3 py-1.5 text-[0.82rem] font-medium rounded-md whitespace-nowrap no-underline transition-colors ${
                  link.active
                    ? "text-white border-b-2 border-[#e8173a]"
                    : "text-[#9090b0] hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="nav-register-btn"
              onClick={() => setModal("register")}
              className="px-4 py-1.5 bg-transparent border border-white/25 rounded-md text-[#d0d0e0] text-sm font-medium hover:border-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Dang ky
            </button>
            <button
              id="nav-login-btn"
              onClick={() => setModal("login")}
              className="px-4 py-1.5 bg-[#e8173a] rounded-md text-white text-sm font-semibold hover:bg-[#c91131] transition-colors cursor-pointer border-0"
            >
              Dang nhap
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[580px] pt-16 flex items-center overflow-hidden transition-all duration-700"
        style={{ background: heroMovie.bannerColor }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,10,20,0.92)] via-[rgba(10,10,20,0.6)] to-[rgba(10,10,20,0.2)]" />

        {/* Cast names top right */}
        <div className="absolute top-24 left-1/2 right-0 flex gap-8 px-12 z-10">
          {heroMovie.cast.slice(0, 3).map((name) => (
            <span key={name} className="text-[0.7rem] font-semibold text-white/40 tracking-[0.12em]">
              {name.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-[560px] px-12 py-20">
          <div className="inline-block px-3 py-1 mb-4 bg-[#e8173a]/20 border border-[#e8173a]/50 rounded-full text-xs font-semibold text-[#f87083] tracking-widest uppercase">
            {heroMovie.genre.join(" / ")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {heroMovie.title}
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-[440px]">
            {heroMovie.description}
          </p>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-2 mb-7">
            {[heroMovie.rating, heroMovie.duration, heroMovie.releaseDate].map((tag) => (
              <span key={tag} className="px-3 py-0.5 bg-white/8 border border-white/10 rounded text-[0.75rem] text-[#b0b0c8]">
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              id="hero-book-btn"
              onClick={() => setModal("login")}
              className="px-7 py-3 bg-[#e8173a] hover:bg-[#c91131] text-white text-sm font-semibold rounded-lg transition-colors border-0 cursor-pointer"
            >
              Dat ve ngay
            </button>
            <button
              id="hero-trailer-btn"
              className="px-7 py-3 bg-white/8 hover:bg-white/14 border border-white/15 text-[#d0d0e0] text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Xem trailer
            </button>
          </div>
        </div>

        {/* Arrows */}
        <button
          id="hero-prev"
          aria-label="Truoc"
          onClick={() => setActiveSlide((s) => (s - 1 + movies.length) % movies.length)}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/8 border border-white/15 text-white text-3xl hover:bg-white/16 transition-colors cursor-pointer"
        >
          &#8249;
        </button>
        <button
          id="hero-next"
          aria-label="Sau"
          onClick={() => setActiveSlide((s) => (s + 1) % movies.length)}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/8 border border-white/15 text-white text-3xl hover:bg-white/16 transition-colors cursor-pointer"
        >
          &#8250;
        </button>

        {/* Dots */}
        <div className="absolute bottom-9 left-12 z-30 flex gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActiveSlide(i)}
              className={`h-2 border-0 rounded-full cursor-pointer transition-all duration-300 p-0 ${
                i === activeSlide ? "bg-[#e8173a] w-5" : "bg-white/30 w-2 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Release date strip */}
        <div className="absolute bottom-0 right-0 z-30 px-7 py-4 bg-[#e8173a]/15 rounded-tl-xl flex flex-col items-end">
          <span className="text-[0.62rem] tracking-[0.12em] text-white/50 font-semibold">NGAY RA MAT</span>
          <span className="text-xl font-bold text-white tracking-wide">{heroMovie.releaseDate}</span>
        </div>
      </section>

      {/* ── MOVIES SECTION ─────────────────────────────────── */}
      <section className="py-16 bg-[#0d0d14]" id="schedule">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex gap-0 bg-white/5 rounded-lg p-1">
              {(["now-showing", "coming-soon"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-medium rounded-md transition-colors border-0 cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#e8173a] text-white"
                      : "text-[#7070a0] hover:text-[#d0d0e0] bg-transparent"
                  }`}
                >
                  {tab === "now-showing" ? "Dang chieu" : "Sap chieu"}
                </button>
              ))}
            </div>
            <a id="see-all-movies" href="#" className="text-sm text-[#e8173a] font-medium no-underline hover:opacity-75 transition-opacity">
              Xem tat ca &rsaquo;
            </a>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayMovies.map((movie) => (
              <div
                key={movie.id}
                id={`movie-card-${movie.id}`}
                className="bg-[#13131f] rounded-xl overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1 duration-200"
              >
                {/* Poster */}
                <div
                  className="relative h-[200px] flex items-end overflow-hidden"
                  style={{ background: movie.posterColor }}
                >
                  {/* Rating badge */}
                  <span className="absolute top-2 left-2 z-20 bg-[#e8173a]/85 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded tracking-wider">
                    {movie.rating}
                  </span>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button
                      id={`book-btn-${movie.id}`}
                      onClick={() => setModal("login")}
                      className="px-4 py-2 bg-[#e8173a] hover:bg-[#c91131] text-white text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors"
                    >
                      Mua ve
                    </button>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 px-2.5 pb-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-bold truncate">{movie.title}</p>
                    <p className="text-white/55 text-[0.65rem]">{movie.genre[0]}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold text-[#f0f0f5] truncate mb-0.5">{movie.title}</h3>
                  <p className="text-xs text-[#6060a0] mb-1">{movie.genre.join(", ")}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#7070a0]">
                    <span>{movie.duration}</span>
                    <span className="text-[#3a3a5a]">•</span>
                    <span>{movie.releaseDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMOTIONS ─────────────────────────────────────── */}
      <section className="py-14 bg-[#0a0a12]" id="promotions">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#f0f0f5] mb-7">Khuyen mai noi bat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {promos.map((promo) => (
              <div
                key={promo.id}
                id={promo.id}
                className={`p-7 rounded-xl border border-white/[0.06] bg-gradient-to-br ${promo.bg} flex flex-col hover:-translate-y-1 transition-transform duration-200 cursor-default`}
              >
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{promo.label}</h3>
                <p className="text-sm text-white/55 leading-relaxed flex-1">{promo.desc}</p>
                <button
                  id={`${promo.id}-btn`}
                  className="mt-4 self-start px-4 py-1.5 bg-transparent border border-white/35 rounded-md text-[#d0d0e0] text-xs font-medium hover:border-white/60 transition-colors cursor-pointer"
                >
                  Xem chi tiet
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-[#07070f] border-t border-white/[0.05]" id="about">
        <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#e8173a] flex items-center justify-center rounded shrink-0 mt-0.5">
              <span className="text-white font-extrabold text-sm">N</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#d0d0e0]">National Cinema Center</p>
              <p className="text-xs text-[#4a4a6a] mt-0.5">Trai nghiem dien anh dinh cao</p>
            </div>
          </div>

          {/* He thong rap */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-1">He thong rap</p>
            {["Ha Noi", "Ho Chi Minh", "Da Nang"].map((city) => (
              <a key={city} href="#" className="text-sm text-[#5a5a7a] no-underline hover:text-[#a0a0c0] transition-colors">{city}</a>
            ))}
          </div>

          {/* Ho tro */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-1">Ho tro</p>
            {["Chinh sach doi tra", "Lien he", "Cau hoi thuong gap"].map((item) => (
              <a key={item} href="#" className="text-sm text-[#5a5a7a] no-underline hover:text-[#a0a0c0] transition-colors">{item}</a>
            ))}
          </div>

          {/* Hotline */}
          <div>
            <p className="text-xs font-bold text-[#a0a0c0] tracking-widest uppercase mb-3">Hotline</p>
            <p className="text-lg font-bold text-[#e8173a]">1900 6017</p>
            <p className="text-xs text-[#4a4a6a] mt-1">8:00 - 22:00 hang ngay</p>
          </div>
        </div>

        <div className="border-t border-white/[0.05] text-center py-4 text-xs text-[#3a3a5a]">
          2026 National Cinema Center. All rights reserved.
        </div>
      </footer>

      {/* ── MODALS ─────────────────────────────────────────── */}
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
