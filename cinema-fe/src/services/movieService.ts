import apiClient from "./apiClient";

export interface Movie {
  _id: string;
  title: string;
  titleEn?: string;
  genres: string[];
  rating: "P" | "K" | "T13" | "T16" | "T18" | "C";
  duration: number;
  releaseDate: string;
  endDate?: string;
  director?: string;
  cast?: string[];
  description?: string;
  poster?: string;
  banner?: string;
  posterColor?: string;
  bannerColor?: string;
  trailerUrl?: string;
  language?: string;
  status: "now_showing" | "coming_soon" | "ended";
  createdAt?: string;
  updatedAt?: string;
}

export interface MoviePayload {
  title: string;
  titleEn?: string;
  genres?: string[] | string;
  rating?: "P" | "K" | "T13" | "T16" | "T18" | "C";
  duration: number;
  releaseDate: string;
  endDate?: string;
  director?: string;
  cast?: string[] | string;
  description?: string;
  poster?: string;
  banner?: string;
  posterColor?: string;
  bannerColor?: string;
  trailerUrl?: string;
  language?: string;
  status?: "now_showing" | "coming_soon" | "ended";
}

export const movieService = {
  getMovies: async (params?: {
    status?: string;
    genre?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      currentPage: number;
      totalPages: number;
      movies: Movie[];
    }>("/movies", { params });
    return res.data;
  },

  getMovieById: async (id: string) => {
    const res = await apiClient.get<{ message: string; movie: Movie }>(
      `/movies/${id}`
    );
    return res.data;
  },

  createMovie: async (payload: MoviePayload) => {
    const res = await apiClient.post<{ message: string; movie: Movie }>(
      "/movies",
      payload
    );
    return res.data;
  },

  updateMovie: async (id: string, payload: MoviePayload) => {
    const res = await apiClient.put<{ message: string; movie: Movie }>(
      `/movies/${id}`,
      payload
    );
    return res.data;
  },

  deleteMovie: async (id: string) => {
    const res = await apiClient.delete<{ message: string; deletedId: string }>(
      `/movies/${id}`
    );
    return res.data;
  },

  updateMovieStatus: async (
    id: string,
    status: "now_showing" | "coming_soon" | "ended"
  ) => {
    const res = await apiClient.patch<{ message: string; movie: Movie }>(
      `/movies/${id}/status`,
      { status }
    );
    return res.data;
  },
};

