import apiClient from "./apiClient";

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getProfile: async () => {
    const res = await apiClient.get<{ message: string; user: UserProfile }>("/profile");
    return res.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const res = await apiClient.put<{ message: string; user: UserProfile }>("/profile", payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const res = await apiClient.put<{ message: string }>("/profile/change-password", payload);
    return res.data;
  },
};
