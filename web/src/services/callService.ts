// services/callService.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { message } from "antd";

class CallService {
  private static instance: CallService;
  private callClient: Client | null = null;

  public static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }

  public async initCallConnection(userId: string): Promise<Client> {
    try {
      if (this.callClient?.connected) {
        return this.callClient;
      }

      const socket = new SockJS("http://localhost:8080/ws");
      this.callClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        reconnectDelay: 0,
        debug: (str) => console.log("[CallService]", str),
      });

      await new Promise<void>((resolve, reject) => {
        this.callClient!.onConnect = () => {
          console.log("Call WebSocket connected");
          resolve();
        };
        this.callClient!.onStompError = (frame) => {
          reject(new Error(frame.headers.message || "Call connection failed"));
        };
        this.callClient!.activate();
      });

      return this.callClient!;
    } catch (error) {
      message.error("Không thể kết nối dịch vụ gọi điện");
      throw error;
    }
  }

  public cleanup() {
    if (this.callClient?.connected) {
      this.callClient.deactivate();
    }
    this.callClient = null;
  }
}

export default CallService.getInstance();
