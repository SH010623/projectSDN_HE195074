import apiClient from "./apiClient";

export interface DashboardKpi {
  totalRevenue: number;
  confirmedBookingsCount: number;
  totalSeatsSold: number;
  refundedRevenue: number;
  refundedCount: number;
  avgOrderValue: number;
  totalUsers: number;
  totalMovies: number;
  nowShowingMovies: number;
  totalRooms: number;
  activeRooms: number;
  totalShowtimes: number;
  activeVouchers: number;
  revenueGrowth?: string;
  bookingsGrowth?: string;
  avgGrowth?: string;
}

export interface WeeklyDataPoint {
  date: string;
  day: string;
  revenue: number;
  tickets: number;
}

export interface TopMovie {
  _id: string;
  title: string;
  titleEn?: string;
  poster?: string;
  rating?: string;
  revenue: number;
  tickets: number;
}

export interface DashboardBookingItem {
  _id: string;
  bookingCode: string;
  seats: string[];
  totalPrice: number;
  finalPrice: number;
  discountAmount?: number;
  status: "confirmed" | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  userId?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  showtimeId?: {
    _id: string;
    startTime?: string;
    date?: string;
    movieId?: {
      _id: string;
      title: string;
      titleEn?: string;
      poster?: string;
      rating?: string;
      duration?: number;
    };
    roomId?: {
      _id: string;
      name: string;
      roomType?: string;
    };
  };
}

export interface DashboardStatsResponse {
  message: string;
  kpi: DashboardKpi;
  sparklines: {
    revenue: number[];
    bookings: number[];
    refunds: number[];
    avgOrder: number[];
  };
  weeklyRevenue: WeeklyDataPoint[];
  recentBookings: DashboardBookingItem[];
  topMovies: TopMovie[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    const res = await apiClient.get<DashboardStatsResponse>("/admin/dashboard/stats");
    return res.data;
  },
};

