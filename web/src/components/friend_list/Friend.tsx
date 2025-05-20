import { Avatar } from "antd";
import { Input, List } from "antd";
import { Card } from "antd";
import { useEffect, useState, useRef } from "react";
import { FaBookmark, FaUserFriends } from "react-icons/fa";
import { friendService, FriendWithStatus } from "../../services/friendService";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAppSelector } from "../../store";

const Friend: React.FC = () => {
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [searchText, setSearchText] = useState("");
  const stompClientRef = useRef<Client | null>(null);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendService.getFriendsWithStatus();
        setFriends(response);
        // Request online status after fetching friends
        if (stompClientRef.current?.connected) {
          const userIds = response.map((friend) => friend.userResponse.id);
          console.log("Requesting online status for users:", userIds);
          stompClientRef.current.publish({
            destination: "/app/online.users",
            body: JSON.stringify(userIds),
          });
        } else {
          console.log("WebSocket not connected");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !currentUser) {
      console.error("No access token or user found");
      return;
    }

    console.log("Initializing WebSocket connection for user:", currentUser.id);
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
        stompClient.subscribe("/topic/status", (message) => {
          console.log("Received status update:", message.body);
          const statusUpdate = JSON.parse(message.body);
          console.log("Parsed status update:", statusUpdate);
          setFriends((prevFriends) =>
            prevFriends.map((friend) =>
              friend.userResponse.id === statusUpdate.userId
                ? {
                    ...friend,
                    userPresenceStatus: statusUpdate.userPresenceStatus,
                    lastActiveAt: statusUpdate.lastActiveAt,
                  }
                : friend
            )
          );
        });

        // Subscribe to online users list
        const onlineUsersDestination = `/user/${currentUser.id}/queue/online.users`;
        console.log("Subscribing to online users at:", onlineUsersDestination);
        stompClient.subscribe(onlineUsersDestination, (message) => {
          console.log("Received online users list:", message.body);
          const onlineUsers = JSON.parse(message.body);
          console.log("Parsed online users:", onlineUsers);
          setFriends((prevFriends) =>
            prevFriends.map((friend) => {
              const presence = onlineUsers[friend.userResponse.id];
              console.log(
                `Updating status for friend ${friend.userResponse.id}:`,
                presence
              );
              return {
                ...friend,
                userPresenceStatus: presence?.userPresenceStatus || "OFFLINE",
                lastActiveAt:
                  presence?.lastActiveAt || new Date().toISOString(),
              };
            })
          );
        });

        // Request initial online status if we have friends
        if (friends.length > 0) {
          const userIds = friends.map((friend) => friend.userResponse.id);
          console.log("Requesting initial online status for users:", userIds);
          stompClient.publish({
            destination: "/app/online.users",
            body: JSON.stringify(userIds),
          });
        }
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

  // Filter friends based on search text
  const filteredFriends = friends?.filter(
    (friend) =>
      friend.userResponse.firstName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      friend.userResponse.lastName
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  return (
    <Card
      size="small"
      title={
        <div className="flex justify-between items-center text-gray-700 text-[17px] font-semibold">
          <span>Người liên hệ</span>
        </div>
      }
      className="bg-white border border-[#e4e6eb] rounded-xl shadow-sm"
      styles={{
        header: {
          background: "#fff",
          border: "none",
          color: "#222",
          padding: "12px 16px",
        },
        body: {
          background: "#fff",
          color: "#222",
          padding: "0 16px 12px",
        },
      }}
    >
      <Input
        placeholder="Tìm kiếm"
        prefix={<FaBookmark className="text-gray-500" />}
        className="mb-2 rounded-full bg-[#f0f2f5] border-none text-black placeholder-gray-500 text-[15px]"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <List
        itemLayout="horizontal"
        dataSource={filteredFriends}
        renderItem={(item) => (
          <List.Item className="hover:bg-[#f0f2f5] rounded-lg transition-all cursor-pointer p-2 text-[15px]">
            <List.Item.Meta
              className="!items-center"
              avatar={
                <div className="relative">
                  <Avatar
                    icon={<FaUserFriends />}
                    src={item.userResponse.avatarUrl}
                  />
                  {item.userPresenceStatus === "ONLINE" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {item.userPresenceStatus === "AWAY" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                  )}
                  {item.userPresenceStatus === "BUSY" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              }
              title={
                <span className="font-medium text-sm text-gray-900 text-[15px]">
                  {item.userResponse.firstName} {item.userResponse.lastName}
                </span>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Friend;
