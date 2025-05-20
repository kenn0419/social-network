import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "POST_TAG"
  | "MESSAGE"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPT";

export interface Notification {
  id: number;
  type: NotificationType;
  avatar: string;
  name: string;
  content: string;
  time: string;
  mutual?: number;
  unread: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.unread) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && notification.unread) {
        notification.unread = false;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.unread = false));
      state.unreadCount = 0;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => n.unread).length;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, setNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
