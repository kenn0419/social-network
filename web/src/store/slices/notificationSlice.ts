import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationResponse } from "../../types/api";

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "POST_TAG"
  | "MESSAGE"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPT";

interface NotificationState {
  notifications: NotificationResponse[];
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
    addNotification: (state, action: PayloadAction<NotificationResponse>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    setNotifications: (
      state,
      action: PayloadAction<NotificationResponse[]>
    ) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, setNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
