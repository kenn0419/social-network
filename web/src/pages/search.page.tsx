import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import { Button, Spin } from "antd";
import { UserResponse } from "../types/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PAGE_SIZE = 20;

const SearchPage: React.FC = () => {
  const query = useQuery();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const search = query.get("query") || "";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const response = await userService.searchUser({
          pageNo: "1",
          pageSize: PAGE_SIZE.toString(),
          search: search.trim(),
        });
        // Map thêm trường friendshipStatus nếu cần
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search]);

  const handleAddFriend = async (userId: number) => {
    await userService.toggleFriend(userId);
    setUsers((prevUsers: UserResponse[]) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              friendshipStatus:
                user.friendshipStatus === null ? "PENDING" : null,
            }
          : user
      )
    );
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "40px auto",
        padding: 0,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 20,
          padding: "20px 24px 10px 24px",
        }}
      >
        Mọi người
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : users.length === 0 ? (
        <div style={{ color: "#888", textAlign: "center", padding: 32 }}>
          Không tìm thấy người dùng nào.
        </div>
      ) : (
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 24px",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                background: "#fff",
                transition: "background 0.2s",
              }}
              onClick={(e) => {
                // Nếu click vào nút thì không chuyển trang
                if (
                  (e.target as HTMLElement).tagName === "BUTTON" ||
                  (e.target as HTMLElement).classList.contains("friend-btn")
                )
                  return;
                navigate(`/profile/${user.id}`);
              }}
            >
              <img
                src={
                  user.avatarUrl ||
                  "https://www.svgrepo.com/show/452030/avatar-default.svg"
                }
                alt={user.firstName + " " + user.lastName}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  marginRight: 16,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>
                  {user.firstName} {user.lastName}
                </div>
                {/* Có thể thêm subtitle, bạn chung, trường học... ở đây nếu API trả về */}
                <div style={{ color: "#888", fontSize: 14 }}>{user.email}</div>
              </div>
              <Button
                className="friend-btn"
                style={{
                  background: "#e7f3ff",
                  color: "#1877f2",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 18px",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFriend(user.id);
                }}
              >
                {user.friendshipStatus === null
                  ? "Thêm bạn bè"
                  : user.friendshipStatus === "PENDING"
                  ? "Đã gửi lời mời"
                  : "Bạn bè"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
