import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Spin } from "antd";
import { UserResponse } from "../../types/api";
import userService from "../../services/userService";

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
    <div className="w-[800px] mx-auto mt-10 bg-white rounded-xl shadow-md p-0">
      <div className="font-semibold text-[20px] px-6 pt-5 pb-2.5">
        Mọi người
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Spin />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-[#888] py-8">
          Không tìm thấy người dùng nào.
        </div>
      ) : (
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center px-6 py-[14px] border-b border-[#f0f0f0] bg-white transition-colors cursor-pointer hover:bg-gray-50"
              onClick={(e) => {
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
                className="w-11 h-11 rounded-full mr-4 object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="font-medium text-[16px]">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[#888] text-[14px]">{user.email}</div>
              </div>
              <Button
                className="friend-btn bg-[#e7f3ff] text-[#1877f2] rounded-lg px-[18px] py-[6px] font-medium text-[15px] border-none cursor-pointer"
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
