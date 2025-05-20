import axiosInstance from "../axios-customize";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/api";

const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/v1/auth/login",
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await axiosInstance.post<void>("/api/v1/auth/register", data);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/api/v1/auth/logout");
    localStorage.removeItem("access_token");
  },

  getCurrentUser: async (): Promise<AuthResponse["user"]> => {
    const response = await axiosInstance.get<AuthResponse["user"]>(
      "/api/v1/auth/me"
    );
    return response.data;
  },
};

export default authService;
