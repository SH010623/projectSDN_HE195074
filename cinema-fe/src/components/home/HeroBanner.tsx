import type { UiMovie } from "./types";

interface HeroBannerProps {
  movieList: UiMovie[];
  activeSlide: number;
  onSelectSlide: (index: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onBookNow: (movie: UiMovie) => void;
}

export default function HeroBanner({
  movieList,
  activeSlide,
  onSelectSlide,
  onPrevSlide,
  onNextSlide,
  onBookNow,
}: HeroBannerProps) {
  if (movieList.length === 0) return null;

  const heroMovie = movieList[activeSlide] || movieList[0];

  const handleWatchTrailer = () => {
    if (heroMovie.trailerUrl) {
      window.open(heroMovie.trailerUrl, "_blank");
    } else {
      alert("Chưa có liên kết trailer cho phim này!");
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[580px] pt-16 flex items-center overflow-hidden transition-all duration-700"
      style={{
        background: heroMovie.banner
          ? `linear-gradient(rgba(10,10,20,0.85), rgba(10,10,20,0.92)), url(${heroMovie.banner}) center/cover no-repeat`
          : heroMovie.bannerColor,
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,10,20,0.95)] via-[rgba(10,10,20,0.7)] to-[rgba(10,10,20,0.3)]" />

      {/* Cast names banner top right */}
      {heroMovie.cast && heroMovie.cast.length > 0 && (
        <div className="absolute top-24 left-1/2 right-0 flex gap-8 px-12 z-10 hidden md:flex">
          {heroMovie.cast.slice(0, 3).map((name) => (
            <span key={name} className="text-[0.7rem] font-semibold text-white/40 tracking-[0.12em]">
              {name.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-[560px] px-12 py-20">
        <div className="inline-block px-3 py-1 mb-4 bg-[#e8173a]/20 border border-[#e8173a]/50 rounded-full text-xs font-semibold text-[#f87083] tracking-widest uppercase">
          {heroMovie.genre.join(" / ")}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
          {heroMovie.title}
        </h1>
        {heroMovie.titleEn && (
          <p className="text-sm text-[#9ca3af] -mt-2 mb-4 font-medium italic">
            {heroMovie.titleEn}
          </p>
        )}
        <p className="text-sm text-white/65 leading-relaxed mb-5 max-w-[440px] line-clamp-3">
          {heroMovie.description}
        </p>

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-7">
          {[heroMovie.rating, heroMovie.duration, heroMovie.releaseDate].map((tag) => (
            <span key={tag} className="px-3 py-0.5 bg-white/8 border border-white/10 rounded text-[0.75rem] text-[#b0b0c8]">
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            id="hero-book-btn"
            onClick={() => onBookNow(heroMovie)}
            className="px-7 py-3 bg-[#e8173a] hover:bg-[#c91131] text-white text-sm font-semibold rounded-lg transition-colors border-0 cursor-pointer shadow-lg shadow-[#e8173a]/30"
          >
            Đặt vé ngay
          </button>
          <button
            id="hero-trailer-btn"
            onClick={handleWatchTrailer}
            className="px-7 py-3 bg-white/8 hover:bg-white/14 border border-white/15 text-[#d0d0e0] text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Xem trailer
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        id="hero-prev"
        aria-label="Trước"
        onClick={onPrevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/8 border border-white/15 text-white text-3xl hover:bg-white/16 transition-colors cursor-pointer"
      >
        &#8249;
      </button>
      <button
        id="hero-next"
        aria-label="Sau"
        onClick={onNextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-white/8 border border-white/15 text-white text-3xl hover:bg-white/16 transition-colors cursor-pointer"
      >
        &#8250;
      </button>

      {/* Carousel Dots */}
      <div className="absolute bottom-9 left-12 z-30 flex gap-2">
        {movieList.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            aria-label={`Slide ${i + 1}`}
            onClick={() => onSelectSlide(i)}
            className={`h-2 border-0 rounded-full cursor-pointer transition-all duration-300 p-0 ${
              i === activeSlide ? "bg-[#e8173a] w-5" : "bg-white/30 w-2 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Release date strip on bottom right */}
      <div className="absolute bottom-0 right-0 z-30 px-7 py-4 bg-[#e8173a]/15 rounded-tl-xl flex flex-col items-end backdrop-blur-sm border-t border-l border-white/[0.08]">
        <span className="text-[0.62rem] tracking-[0.12em] text-white/50 font-semibold uppercase">NGÀY KHỞI CHIẾU</span>
        <span className="text-xl font-bold text-white tracking-wide">{heroMovie.releaseDate}</span>
      </div>
    </section>
  );
}
