import apiClient from "./apiClient";

export interface ReportFilter {
  timeRange: string;
  startDate: string;
  endDate: string;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalTicketsSold: number;
  totalConfirmedOrders: number;
  totalRefundedAmount: number;
  totalRefundedOrders: number;
  avgTicketPrice: number;
  avgOrderValue: number;
  cancellationRate: number;
}

export interface MovieReportItem {
  _id: string;
  title: string;
  titleEn?: string;
  poster?: string;
  rating?: string;
  duration?: number;
  genres?: string[];
  ticketsSold: number;
  revenue: number;
  ordersCount: number;
  revenueShare: number;
}

export interface RoomReportItem {
  _id: string;
  name: string;
  roomType: string;
  totalSeats: number;
  ticketsSold: number;
  revenue: number;
  occupancyRate: number;
}

export interface TimeSlotItem {
  key: string;
  name: string;
  tickets: number;
  revenue: number;
  orders: number;
  share: number;
}

export interface BreakdownItem {
  key: string;
  name: string;
  count: number;
  revenue: number;
  share: number;
}

export interface TopSpenderItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  ticketsCount: number;
  totalSpent: number;
  tier: string;
  tierColor: string;
}

export interface DailyTrendItem {
  date: string;
  displayDate: string;
  revenue: number;
  tickets: number;
  orders: number;
}

export interface VoucherReportItem {
  code: string;
  timesUsed: number;
  totalDiscount: number;
  revenueGenerated: number;
}

export interface ReportAnalyticsResponse {
  message: string;
  filter: ReportFilter;
  summary: ReportSummary;
  insights: string[];
  movieBreakdown: MovieReportItem[];
  roomBreakdown: RoomReportItem[];
  timeSlots: TimeSlotItem[];
  paymentMethods: BreakdownItem[];
  seatTypes: BreakdownItem[];
  voucherList: VoucherReportItem[];
  topSpenders: TopSpenderItem[];
  dailyTrend: DailyTrendItem[];
}

export const reportService = {
  getAnalytics: async (params?: {
    timeRange?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ReportAnalyticsResponse> => {
    const res = await apiClient.get<ReportAnalyticsResponse>("/admin/reports/analytics", {
      params,
    });
    return res.data;
  },
};

