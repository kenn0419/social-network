import { Avatar, Card, Input, List } from "antd";
import { useEffect, useRef, useState } from "react";
import { FaBookmark, FaUserFriends } from "react-icons/fa";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { friendService } from "../../services/friendService";
import { setFriends } from "../../store/slices/friendSlice";

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stompClientRef = useRef<Client | null>(null);
  const friends = useAppSelector((state) => state.friend.friends);
  const [searchText, setSearchText] = useState("");

  const fetchFriends = async () => {
    try {
      const response = await friendService.getFriendsWithStatus();
      dispatch(setFriends(response));

      if (stompClientRef.current?.connected) {
        const userIds = response.map((f) => f.userResponse.id);
        stompClientRef.current.publish({
          destination: "/app/online.users",
          body: JSON.stringify(userIds),
        });
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((f) =>
    `${f.userResponse.firstName} ${f.userResponse.lastName}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <Card
      size="small"
      title={
        <span className="text-[17px] font-semibold text-gray-700">
          Người liên hệ
        </span>
      }
      className="bg-white border border-[#e4e6eb] rounded-xl shadow-sm"
      styles={{
        header: { background: "#fff", padding: "12px 16px" },
        body: { background: "#fff", padding: "0 16px 12px" },
      }}
    >
      <Input
        placeholder="Tìm kiếm"
        prefix={<FaBookmark className="text-gray-500" />}
        className="mb-2 rounded-full bg-[#f0f2f5] border-none text-black text-[15px]"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <List
        itemLayout="horizontal"
        dataSource={filteredFriends}
        renderItem={(item) => (
          <List.Item
            className="hover:bg-[#f0f2f5] rounded-lg p-2 cursor-pointer transition-all"
            onClick={() => navigate(`/chat/?user=${item.userResponse.id}`)}
          >
            <List.Item.Meta
              avatar={
                <div className="relative">
                  <Avatar
                    icon={<FaUserFriends />}
                    src={item.userResponse.avatarUrl}
                  />
                  {item.userPresenceStatus === "ONLINE" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {item.userPresenceStatus === "AWAY" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" />
                  )}
                  {item.userPresenceStatus === "BUSY" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
              }
              title={
                <span className="font-medium text-sm text-gray-900">
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

export default Contact;
