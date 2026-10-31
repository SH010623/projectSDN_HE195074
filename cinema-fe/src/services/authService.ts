import axios from "axios";
import { API_BASE } from "../config/api";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
  phone: string;
  newPassword: string;
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    axios.post<RegisterResponse>(`${API_BASE}/register`, payload),

  login: (payload: LoginPayload) =>
    axios.post<LoginResponse>(`${API_BASE}/login`, payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    axios.post<ForgotPasswordResponse>(`${API_BASE}/forgot-password`, payload),
};
