import apiClient from "./apiClient";
import type { UserProfile } from "./profileService";

export interface AdminUserUpdatePayload {
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export const adminUserService = {
  getUsers: async (params?: { search?: string; role?: string; status?: string }) => {
    const res = await apiClient.get<{
      message: string;
      total: number;
      users: UserProfile[];
    }>("/admin/users", { params });
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get<{ message: string; user: UserProfile }>(
      `/admin/users/${id}`
    );
    return res.data;
  },

  updateUser: async (id: string, payload: AdminUserUpdatePayload) => {
    const res = await apiClient.put<{ message: string; user: UserProfile }>(
      `/admin/users/${id}`,
      payload
    );
    return res.data;
  },

  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch<{ message: string; user: UserProfile }>(
      `/admin/users/${id}/toggle-status`
    );
    return res.data;
  },
};
