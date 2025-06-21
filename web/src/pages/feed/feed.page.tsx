import { Card, Avatar, Button, List } from "antd";
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import CreatePostModal from "../../components/post/create_post_modal.component";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import postService from "../../services/postService";
import { message } from "antd";
import type { PostResponse } from "../../types/api";
import Post from "../../components/post/post.component";

const FeedPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPosts = async () => {
    try {
      if (user != null) {
        const response = await postService.getAllPersonalPosts(user?.id);
        setPosts(response);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      message.error("Không thể tải bài viết. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (content: string, mediaFiles: File[]) => {
    try {
      setIsSubmitting(true);
      await postService.createPost({
        content,
        mediaFiles,
        postType: "PERSONAL",
      });
      message.success("Đăng bài thành công!");
      setIsModalOpen(false);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Đăng bài thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="!my-2 bg-[#242526] rounded-xl shadow border-none">
        <div className="flex items-center space-x-4 gap-2">
          <Avatar size="large" src={user?.avatarUrl} icon={<FaUser />} />
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
        renderItem={(post) => <Post post={post} loadPosts={loadPosts} />}
      />
    </div>
  );
};

export default FeedPage;
