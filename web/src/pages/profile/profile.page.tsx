import { Card, Avatar, Button, Tabs, List, message } from "antd";
import { FaEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import userService from "../../services/userService";
import { PostResponse, UserResponse } from "../../types/api";
import postService from "../../services/postService";
import Post from "../../components/post/post.component";
import { RootState, useAppSelector } from "../../store";

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [profileUser, setProfiletUser] = useState<UserResponse>();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[] | []>([]);
  const fetchProfile = async () => {
    if (id != null) {
      const response = await userService.getProfile(id);
      setProfiletUser(response.user);
      setPosts(response.posts);
      setFriends(response.friends);
    }
  };
  const loadPosts = async () => {
    try {
      if (profileUser != null) {
        const response = await postService.getAllPersonalPosts(profileUser?.id);
        setPosts(response);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      message.error("Không thể tải bài viết. Vui lòng thử lại!");
    }
  };
  useEffect(() => {
    fetchProfile();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-4">
        <div className="relative">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="absolute -bottom-16 left-8">
            <Avatar
              size={120}
              src={
                profileUser?.avatarUrl ||
                "https://www.svgrepo.com/show/452030/avatar-default.svg"
              }
              className={`${
                !profileUser?.avatarUrl && "!bg-gray-300"
              } !p-5 profile-img`}
            />
          </div>
        </div>
        <div className="mt-16 ml-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profileUser?.firstName}</h1>
              <p className="text-gray-500">@{profileUser?.email}</p>
            </div>
            {profileUser?.id === user?.id && (
              <Button icon={<FaEdit />}>Chỉnh sửa trang cá nhân</Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Bài viết",
            children: (
              <List
                dataSource={posts}
                renderItem={(post) => (
                  <Post post={post} loadPosts={loadPosts} />
                )}
              />
            ),
          },
          {
            key: "2",
            label: "Bạn bè",
            children: (
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={friends}
                renderItem={(friend) => (
                  <List.Item>
                    <div
                      key={friend.id}
                      className="flex flex-col items-center justify-center px-6 py-3 border 
                          border-[#f0f0f0] cursor-pointer bg-white transition-colors m-[5px]"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      <img
                        src={
                          friend.avatarUrl ||
                          "https://www.svgrepo.com/show/452030/avatar-default.svg"
                        }
                        alt={friend.firstName + " " + friend.lastName}
                        className="w-11 h-11 rounded-full mr-4 object-cover shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="font-semibold text-base">
                          {friend.firstName} {friend.lastName}
                        </div>
                        <div className="text-[#888] text-sm">
                          {friend.email}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default ProfilePage;
