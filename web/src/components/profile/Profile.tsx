import { Card, Avatar, Button, Tabs, List, Space } from "antd";
import { FaUser, FaEdit, FaCamera } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import userService from "../../services/userService";
import dayjs from "dayjs";
import { PostResponse, UserResponse } from "../../types/api";
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { id } = useParams();
  const [user, setUser] = useState<UserResponse>();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const fetchProfile = async () => {
    const response = await userService.getProfile(id || "1");
    setUser(response.user);
    setPosts(response.posts);
    setFriends(response.friends);
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-4">
        <div className="relative">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="absolute -bottom-16 left-8">
            <Avatar size={120} icon={<FaUser />} />
          </div>
          <div className="absolute top-4 right-4">
            <Button icon={<FaCamera />}>Thêm ảnh bìa</Button>
          </div>
        </div>
        <div className="mt-16 ml-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{user?.firstName}</h1>
              <p className="text-gray-500">@{user?.email}</p>
            </div>
            <Button icon={<FaEdit />}>Chỉnh sửa trang cá nhân</Button>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Bài viết" key="1">
          <List
            dataSource={posts}
            renderItem={(post) => (
              <List.Item>
                <Card className="w-full">
                  <div className="mb-4">{post.content}</div>
                  {post?.postMedia.length > 0 && (
                    <img
                      src={post.postMedia[0].url}
                      alt="Post"
                      className="rounded-lg mb-4"
                    />
                  )}
                  <Space>
                    <span>{post?.likeCount} Thích</span>
                    <span>{post?.comments?.length} Bình luận</span>
                    <span>{dayjs(post?.createdAt).format("DD/MM/YYYY")}</span>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Bạn bè" key="2">
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={friends}
            renderItem={(friend) => (
              <List.Item>{friend.firstName + " " + friend.lastName}</List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;
