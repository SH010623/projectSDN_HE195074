import React from "react";
import type { UiMovie } from "./types";
import MovieCard from "./MovieCard";

interface MovieSectionProps {
  activeTab: "now-showing" | "coming-soon";
  onTabChange: (tab: "now-showing" | "coming-soon") => void;
  movies: UiMovie[];
  onSelectMovie: (movie: UiMovie) => void;
}

export default function MovieSection({
  activeTab,
  onTabChange,
  movies,
  onSelectMovie,
}: MovieSectionProps) {
  return (
    <section className="py-16 bg-[#0d0d14]" id="schedule">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header with Tabs */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/[0.06]">
            {(["now-showing", "coming-soon"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => onTabChange(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-md transition-all border-0 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#e8173a] text-white shadow"
                    : "text-[#8e8ea8] hover:text-[#d0d0e0] bg-transparent"
                }`}
              >
                {tab === "now-showing" ? "Đang chiếu" : "Sắp chiếu"}
              </button>
            ))}
          </div>

          <a
            id="see-all-movies"
            href="#schedule"
            className="text-sm text-[#e8173a] font-semibold no-underline hover:opacity-80 transition-opacity"
          >
            Xem tất cả &rsaquo;
          </a>
        </div>

        {/* Movies Grid */}
        {movies.length === 0 ? (
          <div className="text-center py-16 text-[#7070a0] bg-[#13131f] rounded-2xl border border-white/[0.06]">
            <p className="text-base font-medium">Hiện chưa có phim nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
