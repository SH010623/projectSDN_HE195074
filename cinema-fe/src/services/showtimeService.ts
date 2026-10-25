import apiClient from "./apiClient";
import type { Movie } from "./movieService";
import type { Room } from "./roomService";

// Showtime data interface populated with Movie and Room details
export interface Showtime {
  _id: string;
  movieId: Movie;
  roomId: Room;
  startTime: string;
  endTime: string;
  date: string; // YYYY-MM-DD
  price: number;
  status: "scheduled" | "opened" | "closed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

// Payload for creating or updating a showtime
export interface ShowtimePayload {
  movieId: string;
  roomId: string;
  startTime: string; // ISO string or datetime-local format
  price: number;
  status?: "scheduled" | "opened" | "closed" | "cancelled";
}

// Filter query parameters
export interface ShowtimeFilterParams {
  movieId?: string;
  roomId?: string;
  date?: string;
  status?: string;
}

// Showtime API service
export const showtimeService = {
  // Fetch showtimes list with optional filters
  getShowtimes: async (params?: ShowtimeFilterParams) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      showtimes: Showtime[];
    }>("/showtimes", { params });
    return res.data;
  },

  // Fetch single showtime details
  getShowtimeById: async (id: string) => {
    const res = await apiClient.get<{ message: string; showtime: Showtime }>(
      `/showtimes/${id}`
    );
    return res.data;
  },

  // Create new showtime (Admin)
  createShowtime: async (payload: ShowtimePayload) => {
    const res = await apiClient.post<{ message: string; showtime: Showtime }>(
      "/showtimes",
      payload
    );
    return res.data;
  },

  // Update existing showtime (Admin)
  updateShowtime: async (id: string, payload: Partial<ShowtimePayload>) => {
    const res = await apiClient.put<{ message: string; showtime: Showtime }>(
      `/showtimes/${id}`,
      payload
    );
    return res.data;
  },

  // Delete a showtime (Admin)
  deleteShowtime: async (id: string) => {
    const res = await apiClient.delete<{ message: string; deletedId: string }>(
      `/showtimes/${id}`
    );
    return res.data;
  },

  // Update showtime status (Admin)
  updateShowtimeStatus: async (
    id: string,
    status: "scheduled" | "opened" | "closed" | "cancelled"
  ) => {
    const res = await apiClient.patch<{ message: string; showtime: Showtime }>(
      `/showtimes/${id}/status`,
      { status }
    );
    return res.data;
  },
};
