import React from "react";
import type { UiMovie } from "./types";

interface MovieCardProps {
  movie: UiMovie;
  onSelectMovie: (movie: UiMovie) => void;
}

export default function MovieCard({ movie, onSelectMovie }: MovieCardProps) {
  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => onSelectMovie(movie)}
      className="bg-[#13131f] rounded-xl overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1.5 duration-200 border border-white/[0.04] hover:border-white/[0.15]"
    >
      {/* Poster Image Container */}
      <div
        className="relative h-[220px] flex items-end overflow-hidden"
        style={{ background: movie.posterColor }}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide image if broken link and fallback to gradient
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-white/80 font-bold text-sm">
            {movie.title}
          </div>
        )}

        {/* Age Rating Badge */}
        <span className="absolute top-2 left-2 z-20 bg-[#e8173a]/90 text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded tracking-wider shadow">
          {movie.rating}
        </span>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            id={`book-btn-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(movie);
            }}
            className="px-4 py-2 bg-[#e8173a] hover:bg-[#c91131] text-white text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors shadow-lg shadow-[#e8173a]/40"
          >
            Mua vé
          </button>
        </div>

        {/* Title and Genre Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-2.5 pb-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="text-white text-xs font-bold truncate">{movie.title}</p>
          <p className="text-white/60 text-[0.65rem]">{movie.genre[0] || "Điện ảnh"}</p>
        </div>
      </div>

      {/* Info Details */}
      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-[#f0f0f5] truncate mb-0.5">{movie.title}</h3>
        <p className="text-xs text-[#7070a0] mb-1 truncate">{movie.genre.join(", ")}</p>
        <div className="flex items-center gap-1.5 text-xs text-[#8e8ea8]">
          <span>{movie.duration}</span>
          <span className="text-[#3a3a5a]">•</span>
          <span className="truncate">{movie.releaseDate}</span>
        </div>
      </div>
    </div>
  );
}
