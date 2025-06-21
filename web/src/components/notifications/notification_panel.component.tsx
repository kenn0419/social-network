import React, { useState, useEffect } from "react";
import { Tabs, List, Avatar, Button, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { IoCloseSharp } from "react-icons/io5";
import { RootState } from "../../store";
import {
  markAsRead,
  markAllAsRead,
  setNotifications,
} from "../../store/slices/notificationSlice";
import notificationService from "../../services/notificationService";
import socketService from "../../services/socketService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notification
  );

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      dispatch(setNotifications(response));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    console.log("NotificationPanel mounted");
    socketService.connect();

    fetchNotifications();

    return () => {
      console.log("NotificationPanel unmounting");
      socketService.disconnect();
    };
  }, [dispatch]);

  const filtered =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.read);

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
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      dispatch(setNotifications(updatedNotifications));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="w-[380px] bg-white rounded-xl shadow-md overflow-hidden">
      <div className="font-bold text-[20px] px-5 py-5 border-b border-[#eee] flex justify-between items-center">
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
        className="!px-2"
        items={[
          {
            key: "all",
            label: "Tất cả",
            children: null, // hoặc nội dung nếu có
          },
          {
            key: "unread",
            label: `Chưa đọc ${unreadCount > 0 ? `(${unreadCount})` : ""}`,
            children: null,
          },
        ]}
      />

      <div className="max-h-[400px] overflow-y-auto px-2 pb-2">
        <List
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item
              className={`relative cursor-pointer mb-1 rounded-lg p-3 ${
                item.read ? "bg-white" : "bg-[#f0f7ff]"
              }`}
              onClick={() => {
                if (!item.read) {
                  handleMarkAsRead(item.id);
                }
                navigate(`${item.url}`);
                onClose();
              }}
            >
              <List.Item.Meta
                className="p-2"
                avatar={
                  <Badge dot={!item.read} offset={[-2, 2]}>
                    <Avatar
                      src={
                        item.senderAvatarUrl ||
                        "https://www.svgrepo.com/show/452030/avatar-default.svg"
                      }
                      size={44}
                    />
                  </Badge>
                }
                title={<span>{item.senderName}</span>}
                description={
                  <div className="!flex !flex-col">
                    <span className="text-black">{item.content}</span>
                    <span className="text-[#888] text-[13px]">
                      {dayjs(item.createdAt).format("HH:mm DD-MM-YYYY")}
                      {/* {item.type === "FRIEND_REQUEST" && (
                      <span className="ml-2 text-[#1877f2]">
                        {item.mutual} bạn chung
                      </span>
                    )} */}
                    </span>
                  </div>
                }
              />

              {/* {item.type === "FRIEND_REQUEST" && (
                <div className="mt-2 flex gap-2">
                  <Button type="primary" size="small">
                    Xác nhận
                  </Button>
                  <Button size="small">Xóa</Button>
                </div>
              )} */}

              <Button
                type="text"
                size="small"
                className="!absolute !top-2 !right-2 !rounded-full !px-3 !py-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(item.id);
                }}
              >
                <IoCloseSharp size={25} />
              </Button>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default NotificationPanel;
