import { Client, IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { store } from "../store";
import { addNotification } from "../store/slices/notificationSlice";
import { notification } from "antd";

class SocketService {
  private client: Client | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect() {
    if (!this.client) {
      const state = store.getState();
      const userId = state.auth.user?.id;

      if (!userId) {
        console.error("No user found in Redux store");
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        debug: (str) => {
          console.log("WebSocket Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.subscribeToNotifications();
      };

      this.client.onStompError = (frame: IFrame) => {
        notification.error({
          message: "WebSocket Error",
          description: "Failed to connect to notification service" + frame,
        });
      };

      this.client.onWebSocketError = (event) => {
        notification.error({
          message: "WebSocket Error",
          description: event,
        });
      };

      this.client.onWebSocketClose = (event) => {
        console.log("Connection Closed", event);
      };

      this.client.activate();
    }
    return this.client;
  }

  private subscribeToNotifications() {
    if (this.client?.connected) {
      const state = store.getState();
      const userId = state.auth.user?.id;

      if (!userId) {
        console.error("No user found in Redux store");
        return;
      }

      const destination = `/user/${userId}/queue/notifications`;
      // console.log("Subscribing to destination:", destination);

      this.client.subscribe(destination, (message) => {
        // console.log("Raw notification message:", message);
        // console.log("Message headers:", message.headers);
        // console.log("Message body:", message.body);

        try {
          const notificationData = JSON.parse(message.body);
          // console.log("Parsed notification:", notificationData);

          if (!notificationData || !notificationData.type) {
            // console.error("Invalid notification format:", notificationData);
            return;
          }

          store.dispatch(addNotification(notificationData));
          // console.log("Notification added to store successfully");

          // Show notification
          notification.info({
            message: "New Notification",
            description: notificationData.content,
            duration: 4.5,
          });
        } catch (error) {
          console.error("Error parsing notification:", error);
          console.error("Raw message body:", message.body);
          notification.error({
            message: "Notification Error",
            description: "Failed to process notification",
          });
        }
      });
      // console.log("Successfully subscribed to notifications");
    } else {
      console.error("Cannot subscribe: WebSocket not connected");
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  public getClient(): Client | null {
    return this.client;
  }
}

export default SocketService.getInstance();
