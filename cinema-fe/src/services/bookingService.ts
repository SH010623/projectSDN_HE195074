import apiClient from "./apiClient";
import type { Movie } from "./movieService";
import type { Room } from "./roomService";
import type { Showtime } from "./showtimeService";

export interface SeatDetail {
  seatNumber: string;
  seatType: "standard" | "vip";
  price: number;
}

export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  showtimeId: {
    _id: string;
    movieId: Movie;
    roomId: Room;
    startTime: string;
    endTime: string;
    date: string;
    price: number;
  };
  seats: string[];
  seatDetails: SeatDetail[];
  totalPrice: number;
  voucherCode?: string;
  discountAmount: number;
  finalPrice: number;
  bookingCode: string;
  paymentMethod: "sepay" | "momo_mock" | "vnpay_mock" | "card_mock" | "cash";
  paymentStatus: "pending" | "paid" | "refunded" | "review";
  status: "pending" | "confirmed" | "cancelled" | "expired";
  expiresAt?: string;
  paidAt?: string;
  bookingDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  showtimeId: string;
  seats: string[];
  voucherCode?: string;
  paymentMethod?: "sepay" | "momo_mock" | "vnpay_mock" | "card_mock" | "cash";
}

export interface OccupiedSeatsResponse {
  message: string;
  showtime: Showtime;
  occupiedSeats: string[];
}

export interface PaymentDetails {
  accountNumber: string;
  bank: string;
  accountName: string;
  amount: number;
  content: string;
  expiresAt: string;
  qrUrl: string;
}

export interface BookingResponse {
  message: string;
  booking: Booking;
  payment: PaymentDetails | null;
}

// Booking API Service
export const bookingService = {
  // Get occupied seats and showtime layout
  getOccupiedSeats: async (showtimeId: string) => {
    const res = await apiClient.get<OccupiedSeatsResponse>(
      `/bookings/showtime/${showtimeId}/seats`
    );
    return res.data;
  },

  // Create booking with mock payment
  createBooking: async (payload: CreateBookingPayload) => {
    const res = await apiClient.post<BookingResponse>(
      "/bookings",
      payload
    );
    return res.data;
  },

  // Get current user's tickets
  getMyTickets: async () => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      bookings: Booking[];
    }>("/bookings/my-tickets");
    return res.data;
  },

  // Get single booking details
  getBookingById: async (id: string) => {
    const res = await apiClient.get<BookingResponse>(
      `/bookings/${id}`
    );
    return res.data;
  },

  // Cancel a booking
  cancelBooking: async (id: string) => {
    const res = await apiClient.patch<{ message: string; booking: Booking }>(
      `/bookings/${id}/cancel`
    );
    return res.data;
  },

  // Admin get all bookings
  getAllBookings: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      currentPage: number;
      totalPages: number;
      bookings: Booking[];
    }>("/bookings/admin/all", { params });
    return res.data;
  },
};
