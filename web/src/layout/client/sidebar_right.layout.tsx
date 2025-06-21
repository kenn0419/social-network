import { Card, Avatar, List, Button } from "antd";
import { FaUserFriends } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FriendShipResponse } from "../../types/api";
import friendShipService from "../../services/friendShipService";
import Contact from "../../components/contact/contact.component";

const SidebarRight: React.FC = () => {
  const [friendshipRequests, setFriendshipRequests] = useState<
    FriendShipResponse[]
  >([]);

  const fetchAllFriendshipRequest = async () => {
    const response = await friendShipService.getFriendRequests();
    setFriendshipRequests(response.splice(0, 2));
  };

  const handleRespond = async (id: number, status: string) => {
    await friendShipService.respondFriendRequest(id, status);
    fetchAllFriendshipRequest();
  };

  useEffect(() => {
    fetchAllFriendshipRequest();
  }, []);
  return (
    <div className="w-full flex flex-col gap-4 pt-4 pr-2 text-[15px]">
      <Card
        size="small"
        title={
          <div className="flex justify-between items-center text-gray-700 text-[17px] font-semibold">
            <span>Lời mời kết bạn</span>
            <Link
              to="/friends"
              className="text-xs text-[#1877f2] hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
        }
        className="mb-2 bg-white border border-[#e4e6eb] rounded-xl shadow-sm"
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
        <List
          itemLayout="horizontal"
          dataSource={friendshipRequests}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  size="small"
                  type="primary"
                  className="rounded-full bg-[#1877f2] hover:bg-[#166fe5] border-none text-[15px]"
                  onClick={() => handleRespond(item.requester.id, "ACCEPT")}
                >
                  Chấp nhận
                </Button>,
                <Button
                  size="small"
                  className="rounded-full bg-[#f0f2f5] text-gray-800 border-none hover:bg-[#e4e6eb] text-[15px]"
                  onClick={() => handleRespond(item.requester.id, "REJECT")}
                >
                  Từ chối
                </Button>,
              ]}
              className="hover:bg-[#f0f2f5] rounded-lg transition-all cursor-pointer p-2 text-[15px]"
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<FaUserFriends />}
                    src={item.requester.avatarUrl}
                  />
                }
                title={
                  <span className="font-medium text-sm text-gray-900 text-[15px] whitespace-nowrap">
                    {item.requester.firstName} {item.requester.lastName}
                  </span>
                }
                // description={
                //   <span className="text-xs text-gray-500 text-[14px]">
                //     0 bạn chung
                //   </span>
                // }
              />
            </List.Item>
          )}
        />
      </Card>

      <Contact />
    </div>
  );
};

export default SidebarRight;
