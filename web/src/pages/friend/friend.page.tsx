import React, { useState, useEffect } from "react";
import { Button, Avatar, List, Layout } from "antd";
import friendShipService from "../../services/friendShipService";
import { useNavigate } from "react-router-dom";
import { FriendShipResponse, UserResponse } from "../../types/api";
import { friendService } from "../../services/friendService";
const { Sider, Content } = Layout;

const TABS = [
  { key: "requests", label: "Lời mời kết bạn" },
  { key: "all", label: "Tất cả bạn bè" },
];

const FriendPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<FriendShipResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);

  const handleRender = async () => {
    if (activeTab === "requests") {
      const response = await friendShipService.getFriendRequests();
      setRequests(response);
    } else {
      const response = await friendService.getAllFriends();
      setFriends(response);
    }
  };

  const handleRespond = async (id: number, status: string) => {
    await friendShipService.respondFriendRequest(id, status);
    handleRender();
  };

  useEffect(() => {
    handleRender();
  }, [activeTab]);

  return (
    <>
      <Layout
        style={{
          background: "#f0f2f5",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Sider width={260} style={{ background: "#fff", padding: 0 }}>
          <div className="font-bold text-[22px] p-6 border-none border border-b-[1px] border-b-[#eee]">
            Bạn bè
          </div>
          <div>
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className={`px-6 py-4 cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#e7f3ff] font-semibold"
                    : "bg-white font-normal"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </Sider>
        <Content style={{ padding: 32 }}>
          <div className="font-semibold text-xl mb-6">
            {activeTab === "requests" ? "Lời mời kết bạn" : "Tất cả bạn bè"}
          </div>
          {activeTab === "requests" ? (
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={requests}
              renderItem={(item) => (
                <List.Item>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Avatar
                      size={64}
                      src={
                        item.requester.avatarUrl ||
                        "https://www.svgrepo.com/show/452030/avatar-default.svg"
                      }
                      style={{ marginBottom: 12, cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${item.requester.id}`)}
                    />
                    <div className="font-medium">
                      {item.requester.firstName + " " + item.requester.lastName}
                    </div>

                    <Button
                      type="primary"
                      className="w-full mt-3 mb-1"
                      onClick={() => handleRespond(item.requester.id, "ACCEPT")}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      style={{ width: "100%" }}
                      onClick={() => handleRespond(item.requester.id, "REJECT")}
                    >
                      Xóa
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={friends}
              renderItem={(item) => (
                <List.Item>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      padding: 16,
                      textAlign: "center",
                    }}
                  >
                    <Avatar
                      size={64}
                      src={item.avatarUrl}
                      style={{ marginBottom: 12 }}
                    />
                    <div className="font-medium">
                      {item.firstName + " " + item.lastName}
                    </div>
                    <Button
                      style={{ marginTop: 12, width: "100%" }}
                      onClick={() => navigate(`/chat?user=${item.id}`)}
                    >
                      Nhắn tin
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Content>
      </Layout>
    </>
  );
};

export default FriendPage;
