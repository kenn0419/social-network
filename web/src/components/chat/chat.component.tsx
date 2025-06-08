import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Avatar, Button, message } from "antd";
import { FiInfo, FiPhone, FiVideo } from "react-icons/fi";
import { RiSendPlaneFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { MessageResponse, UserResponse } from "../../types/api";
import messageService from "../../services/messageService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import dayjs from "dayjs";
import callService from "../../services/callService";
import { v4 as uuidv4 } from "uuid";

const Chat = ({
  currentUser,
  receiver,
  messages,
  setMessages,
  getMessagesFromUser,
}: {
  currentUser: UserResponse;
  receiver: UserResponse;
  messages: MessageResponse[];
  setMessages: Dispatch<SetStateAction<MessageResponse[]>>;
  getMessagesFromUser: (id: number) => Promise<void>;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");
  const stompClientRef = useRef<Client | null>(null);

  const [input, setInput] = useState("");
  const [isShowChatInfo, setIsShowChatInfo] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      setInput("");
    } else {
      const response = await messageService.createMessage(receiver.id, content);
      if (response) {
        setInput("");
        if (userId) {
          getMessagesFromUser(+userId);
        }
      }
    }
  };

  // components/chat/Chat.tsx (phần gọi điện)
  const handleStartCall = async () => {
    try {
      // Kiểm tra quyền truy cập trước
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());

      // Khởi tạo kết nối WebSocket cho cuộc gọi
      const client = await callService.initCallConnection(
        currentUser.id.toString()
      );

      const newCallId = uuidv4();
      client.publish({
        destination: "/app/call.initiate",
        body: JSON.stringify({
          receiverId: receiver.id,
          callId: newCallId,
          callerName: `${currentUser.firstName} ${currentUser.lastName}`,
        }),
      });

      // Chuyển hướng sau khi đã publish thành công
      navigate(`/call/${newCallId}?receiverId=${receiver.id}&initiator=true`);
    } catch (error) {
      console.error("Failed to start call:", error);
      message.error("Không thể bắt đầu cuộc gọi");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !currentUser) {
      message.error("No access token or user found");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      onConnect: () => {
        console.log("WebSocket connected successfully");
        console.log("Current user:", currentUser);

        // Subscribe to status updates
        stompClient.subscribe(
          `/user/${currentUser.id}/queue/messages`,
          (message: IMessage) => {
            console.log("Received message nè:", message.body);
            const messageResponse = JSON.parse(message.body);
            setMessages((prev) => [...prev, messageResponse]);
          }
        );
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
      onWebSocketClose: (event) => {
        console.log("WebSocket connection closed:", event);
      },
    });

    stompClientRef.current = stompClient;
    stompClient.activate();

    return () => {
      if (stompClientRef.current) {
        console.log("Deactivating WebSocket connection");
        stompClientRef.current.deactivate();
      }
    };
  }, [currentUser]);

  return (
    <>
      <div className="flex-1 flex flex-col relative bg-white rounded-xl shadow h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center p-4 bg-white rounded-t-xl">
          <div
            className="relative cursor-pointer"
            onClick={() => navigate(`/profile/${receiver.id}`)}
          >
            <Avatar
              src={receiver?.avatarUrl || undefined}
              size={40}
              icon={<FaUser />}
            />
          </div>
          <div className="flex-1 ml-3">
            <div className="font-semibold text-base">
              {receiver.firstName} {receiver.lastName}
            </div>
            <div className="text-xs text-gray-500">Đang hoạt động</div>
          </div>
          <div className="flex space-x-2 items-center">
            <Button
              className="p-2 !border-none hover:bg-gray-100 rounded-full !text-xl text-gray-600"
              onClick={handleStartCall}
            >
              <FiPhone />
            </Button>
            <Button className="p-2 !border-none hover:bg-gray-100 rounded-full !text-xl text-gray-600">
              <FiVideo />
            </Button>
            <Button
              className="p-2 !border-none hover:bg-gray-100 rounded-full !text-xl text-gray-600"
              onClick={() => setIsShowChatInfo((prev) => !prev)}
            >
              <FiInfo />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f0f2f5]">
          {messages.map((msg, index) => {
            const isMe = msg.sender.id === currentUser.id;
            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`rounded-2xl px-4 py-2 max-w-xs shadow-sm ${
                    isMe ? "bg-[#8b5cf6] text-white" : "bg-white text-gray-900"
                  }`}
                  title={dayjs(msg.createdAt).format("HH:mm DD-MM-YYYY")}
                >
                  {msg.content}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 bg-white flex items-center rounded-b-xl">
          <input
            className="flex-1 p-2 rounded-full bg-gray-100 focus:outline-none"
            placeholder="Aa"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(input);
              }
            }}
          />
          <Button
            className="ml-2 !border-none !text-2xl !text-blue-500 !hover:text-blue-600"
            onClick={() => handleSendMessage(input)}
          >
            <RiSendPlaneFill />
          </Button>
        </div>
      </div>

      {/* Chat Info */}
      {isShowChatInfo && (
        <div className="w-80 bg-white p-4 rounded-xl shadow h-full">
          <div className="flex flex-col items-center">
            <Avatar
              src={receiver?.avatarUrl || ""}
              size={60}
              icon={<FaUser />}
              className="mb-2 border"
            />
            <div className="font-semibold text-lg">
              {receiver?.firstName + " " + receiver?.lastName}
            </div>
          </div>
          <div className="mt-6">
            <div className="font-semibold mb-2">Thông tin về đoạn chat</div>
            <div className="text-gray-500 text-sm">
              Tùy chỉnh đoạn chat, file phương tiện, quyền riêng tư...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
