import apiClient from "./apiClient";

export interface NewsItem {
  _id: string;
  title: string;
  summary?: string;
  content: string;
  image?: string;
  category: "Tin điện ảnh" | "Khuyến mãi" | "Sự kiện" | "Thông báo" | string;
  author?: string;
  views: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsPayload {
  title: string;
  summary?: string;
  content: string;
  image?: string;
  category?: "Tin điện ảnh" | "Khuyến mãi" | "Sự kiện" | "Thông báo" | string;
  author?: string;
  isActive?: boolean;
}

export const newsService = {
  getNews: async (params?: {
    category?: string;
    search?: string;
    all?: string;
    sort?: "newest" | "older" | string;
    timeRange?: "all" | "this_month" | string;
  }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      news: NewsItem[];
    }>("/news", { params });
    return res.data;
  },

  getNewsById: async (id: string) => {
    const res = await apiClient.get<{ message: string; news: NewsItem }>(`/news/${id}`);
    return res.data;
  },

  createNews: async (payload: NewsPayload) => {
    const res = await apiClient.post<{ message: string; news: NewsItem }>("/news", payload);
    return res.data;
  },

  updateNews: async (id: string, payload: NewsPayload) => {
    const res = await apiClient.put<{ message: string; news: NewsItem }>(`/news/${id}`, payload);
    return res.data;
  },

  toggleNewsStatus: async (id: string) => {
    const res = await apiClient.patch<{ message: string; news: NewsItem }>(
      `/news/${id}/toggle-status`
    );
    return res.data;
  },

  deleteNews: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/news/${id}`);
    return res.data;
  },
};
