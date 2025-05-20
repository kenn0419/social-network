import React, { useState, useEffect } from "react";
import { Tabs, List, Avatar, Button, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  markAsRead,
  markAllAsRead,
  setNotifications,
} from "../../store/slices/notificationSlice";
import notificationService from "../../services/notificationService";
import socketService from "../../services/socketService";
const { TabPane } = Tabs;

const NotificationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notification
  );

  useEffect(() => {
    console.log("NotificationPanel mounted");
    // Kết nối WebSocket khi component mount
    socketService.connect();

    // Fetch notifications khi component mount
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications...");
        const response = await notificationService.getNotifications();
        console.log("Received notifications:", response.data);
        dispatch(setNotifications(response.data));
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();

    // Cleanup khi component unmount
    return () => {
      console.log("NotificationPanel unmounting");
      socketService.disconnect();
    };
  }, [dispatch]);

  const filtered =
    activeTab === "all" ? notifications : notifications.filter((n) => n.unread);

  console.log("Current notifications:", notifications);
  console.log("Filtered notifications:", filtered);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markNotificationAsRead(id);
      dispatch(markAsRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      // Cập nhật state sau khi xóa
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      dispatch(setNotifications(updatedNotifications));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div
      style={{
        width: 380,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 20,
          padding: 20,
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Thông báo</span>
        {unreadCount > 0 && (
          <Button type="link" onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ padding: "0 20px" }}
      >
        <TabPane tab="Tất cả" key="all" />
        <TabPane
          tab={`Chưa đọc ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
          key="unread"
        />
      </Tabs>
      <div
        style={{ maxHeight: 400, overflowY: "auto", padding: "0 8px 8px 8px" }}
      >
        <List
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.unread ? "#f0f7ff" : "#fff",
                borderRadius: 8,
                marginBottom: 4,
                padding: 12,
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => item.unread && handleMarkAsRead(item.id)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={item.unread} offset={[-2, 2]}>
                    <Avatar
                      src={
                        item.avatar ||
                        "https://www.svgrepo.com/show/452030/avatar-default.svg"
                      }
                      size={44}
                    />
                  </Badge>
                }
                title={
                  <span>
                    <b>{item.name}</b> {item.content}
                  </span>
                }
                description={
                  <span style={{ color: "#888", fontSize: 13 }}>
                    {item.time}
                    {item.type === "FRIEND_REQUEST" && (
                      <span style={{ marginLeft: 8, color: "#1877f2" }}>
                        {item.mutual} bạn chung
                      </span>
                    )}
                  </span>
                }
              />
              {item.type === "FRIEND_REQUEST" && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Button type="primary" size="small">
                    Xác nhận
                  </Button>
                  <Button size="small">Xóa</Button>
                </div>
              )}
              <Button
                type="text"
                size="small"
                style={{ position: "absolute", top: 8, right: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(item.id);
                }}
              >
                ×
              </Button>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default NotificationPanel;
