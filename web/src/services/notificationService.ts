import axiosInstance from "../axios_customize";
import { NotificationResponse } from "../types/api";

const notificationService = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await axiosInstance.get<NotificationResponse[]>(
      "/api/v1/notifications"
    );

    return response.data;
  },

  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await axiosInstance.patch(`/api/v1/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await axiosInstance.put("/api/v1/notifications/read-all");
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/notifications/${notificationId}`);
  },
};

export default notificationService;
