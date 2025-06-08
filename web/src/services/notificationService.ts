import axiosInstance from "../axios_customize";
import { Notification } from "../store/slices/notificationSlice";
import { NotificationResponse } from "../types/api";

const notificationService = {
  // Notification APIs
  getNotifications: async (): Promise<{ data: Notification[] }> => {
    const response = await axiosInstance.get<{ data: NotificationResponse[] }>(
      "/api/v1/notifications"
    );

    // Transform the response to match our frontend Notification interface
    const notifications: Notification[] = response.data.data.map(
      (notification) => ({
        id: notification.id,
        type: notification.type,
        content: notification.content,
        avatar: notification.senderAvatarUrl,
        name: notification.senderName,
        time: new Date(notification.createdAt).toLocaleString(),
        unread: !notification.isRead,
      })
    );

    return { data: notifications };
  },

  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await axiosInstance.put(`/api/v1/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await axiosInstance.put("/api/v1/notifications/read-all");
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/notifications/${notificationId}`);
  },
};

export default notificationService;
