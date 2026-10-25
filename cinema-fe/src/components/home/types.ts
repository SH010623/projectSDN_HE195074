// Types for Home Page components
export interface UiMovie {
  id: string | number;
  title: string;
  titleEn: string;
  genre: string[];
  rating: string;
  duration: string;
  releaseDate: string;
  director: string;
  cast: string[];
  description: string;
  poster?: string;
  banner?: string;
  posterColor: string;
  bannerColor: string;
  badge?: "now-showing" | "coming-soon";
  trailerUrl?: string;
}

export interface PromoItem {
  id: string;
  label: string;
  desc: string;
  bg: string;
}
