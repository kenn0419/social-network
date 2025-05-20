import axiosClient, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Mutex } from "async-mutex";
import { AuthResponse } from "./types/api";

// Tạo instance axios với base URL
const axiosInstance: AxiosInstance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  withCredentials: true,
});

const mutex = new Mutex();
const NO_RETRY_HEADER = "x-no-retry";

const handleRefreshToken = async (): Promise<string | null> => {
  return await mutex.runExclusive(async () => {
    const res = await axiosInstance.get<AuthResponse>("/api/v1/auth/refresh");
    if (res && res.data) {
      localStorage.setItem("access_token", res.data.accessToken);
      return res.data.accessToken;
    }
    return null;
  });
};

// Request interceptor
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (
    typeof window !== "undefined" &&
    window &&
    window.localStorage &&
    window.localStorage.getItem("access_token")
  ) {
    config.headers.Authorization =
      "Bearer " + window.localStorage.getItem("access_token");
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      error.response?.status === 401 &&
      originalRequest.url !== "/api/v1/auth/login" &&
      !originalRequest.headers[NO_RETRY_HEADER]
    ) {
      localStorage.removeItem("access_token");
      originalRequest.headers["Authorization"] = `Bearer `;
      const access_token = await handleRefreshToken();
      originalRequest.headers[NO_RETRY_HEADER] = "true";
      if (access_token) {
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        window.localStorage.setItem("access_token", access_token);
        return axiosInstance.request(originalRequest);
      }
    }
  }
);

export default axiosInstance;
