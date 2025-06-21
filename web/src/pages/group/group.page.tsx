import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import groupService from "../../services/groupService";
import { GroupResponse, PostResponse } from "../../types/api";
import Title from "antd/es/typography/Title";
import { Avatar, Button, Card, List, message, Tabs } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import postService from "../../services/postService";
import { RootState, useAppSelector } from "../../store";
import { FaUser } from "react-icons/fa";
import CreatePostModal from "../../components/post/create_post_modal.component";
import Post from "../../components/post/post.component";

const GroupPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupResponse>();
  const fetchGroupInfo = async () => {
    if (id != null) {
      const response = await groupService.getGroupInfo(id);
      setGroupInfo(response);
      setPosts(response.posts);
    }
  };

  const handleCreatePost = async (content: string, mediaFiles: File[]) => {
    try {
      setIsSubmitting(true);
      await postService.createPost({
        content,
        mediaFiles,
        postType: "GROUP",
        groupId: groupInfo?.id,
      });
      message.success("Đăng bài thành công!");
      setIsModalOpen(false);
      fetchGroupInfo();
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Đăng bài thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchGroupInfo();
  }, []);
  return (
    <div className="bg-gray-300 h-full min-h-screen">
      <div className="flex flex-col bg-white max-w-6xl mx-auto h-full">
        <div className="relative w-full h-90 bg-gray-200 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
          <img
            src={groupInfo?.coverImageUrl}
            alt="Group Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <Title level={2} className="!mb-1">
            {groupInfo?.name || "Tên nhóm"}
          </Title>
          <div className="text-gray-500 mb-2 text-lg">
            <span>
              {groupInfo?.groupStatus === "PRIVATE"
                ? "Nhóm riêng tư"
                : "Nhóm công khai"}
            </span>{" "}
            ·{" "}
            <span className="font-semibold">
              {groupInfo?.members?.length} thành viên
            </span>
          </div>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "Giới thiệu",
                children: (
                  <Paragraph className="text-gray-700 mb-6 line-clamp-3">
                    {groupInfo?.description}
                  </Paragraph>
                ),
              },
              {
                key: "2",
                label: "Bài viết",
                children: (
                  <>
                    <Card className="!my-2 bg-[#242526] rounded-xl shadow border-none">
                      <div className="flex items-center space-x-4 gap-2">
                        <Avatar
                          size="large"
                          src={user?.avatarUrl}
                          icon={<FaUser />}
                        />
                        <Button
                          onClick={() => setIsModalOpen(true)}
                          className="flex-1 !bg-[#E4E6E9] !text-[#65686c] !text-[18px] !p-5 !rounded-full !justify-start"
                        >
                          {user
                            ? `${user.firstName} ${user.lastName}, bạn đang nghĩ gì?`
                            : "Bạn đang nghĩ gì?"}
                        </Button>
                      </div>
                    </Card>

                    {user && (
                      <CreatePostModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleCreatePost}
                        userAvatar={user.avatarUrl}
                        userName={`${user.firstName} ${user.lastName}`}
                        isSubmitting={isSubmitting}
                      />
                    )}

                    <List
                      dataSource={posts}
                      renderItem={(post) => (
                        <Post post={post} loadPosts={fetchGroupInfo} />
                      )}
                    />
                  </>
                ),
              },
              {
                key: "3",
                label: "Thành viên",
                children: (
                  <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={[
                      groupInfo?.owner,
                      ...(groupInfo?.members || []),
                    ]}
                    renderItem={(member) => (
                      <List.Item>
                        <div
                          key={member?.id}
                          className="flex flex-col items-center justify-center px-6 py-3 cursor-pointer bg-white transition-colors m-[5px]"
                          onClick={() => navigate(`/profile/${member?.id}`)}
                        >
                          <img
                            src={
                              member?.avatarUrl ||
                              "https://www.svgrepo.com/show/452030/avatar-default.svg"
                            }
                            alt={member?.firstName + " " + member?.lastName}
                            className="w-11 h-11 rounded-full mr-4 object-cover shrink-0"
                          />
                          {member?.id === groupInfo?.owner.id && (
                            <span className="text-gray-500">Quản trị viên</span>
                          )}
                          <div className="flex-1 flex flex-col justify-center items-center">
                            <div className="font-semibold text-base">
                              {member?.firstName} {member?.lastName}
                            </div>
                            <div className="text-[#888] text-sm">
                              {member?.email}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
            className="flex-grow"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
