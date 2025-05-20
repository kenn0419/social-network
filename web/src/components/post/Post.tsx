import React, { useState } from "react";
import { Card, Avatar, Image, Button } from "antd";
import {
  FaUser,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaRegCommentDots,
} from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import dayjs from "dayjs";
import { PostResponse, PostMediaResponse } from "../../types/api";
import { message } from "antd";
import postService from "../../services/postService";
import Comment from "../comment/comment.component";
interface PostCardProps {
  post: PostResponse;
  loadPosts: () => void;
}

const Post: React.FC<PostCardProps> = ({ post, loadPosts }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const handleActionPost = async (postId: number) => {
    try {
      await postService.actionPost(postId);
      loadPosts();
    } catch (error) {
      console.error("Error liking post:", error);
      message.error("Không thể thích bài viết. Vui lòng thử lại!");
    }
  };

  const handleCopyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Đã sao chép liên kết!");
    } catch (err) {
      console.error("Lỗi khi copy: ", err);
    }
  };

  return (
    <>
      <Card className="!my-2 bg-[#242526] rounded-xl shadow border-none">
        {/* Post Header */}
        <div className="flex items-center mb-4">
          <Avatar size={40} src={post.author.avatarUrl} icon={<FaUser />} />
          <div className="ml-3">
            <div className="font-semibold text-[15px]">
              {post.author.firstName} {post.author.lastName}
            </div>
            <div className="text-gray-400 text-[13px]">
              {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm")}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4 text-[15px]">{post.content}</div>

        {/* Post Media */}
        {post.postMedia && post.postMedia.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {post.postMedia.map((file: PostMediaResponse, index: number) =>
                file.type === "IMAGE" ? (
                  <Image
                    key={index}
                    src={file.url}
                    alt={`Post media ${index + 1}`}
                    className="rounded-lg"
                  />
                ) : file.type === "VIDEO" ? (
                  <video
                    key={index}
                    src={file.url}
                    controls
                    className="w-full rounded-lg"
                  />
                ) : null
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E7E8EA]">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="flex items-center gap-1">
              <BiLike />
              {post.likeCount}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <FaRegCommentDots />
              {post.comments.length}
            </span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex justify-between border-b border-[#E7E8EA] py-2 my-2">
          <Button
            type="text"
            icon={<FaThumbsUp color={post.liked ? "blue" : "gray"} />}
            className="!text-gray-400"
            onClick={() => handleActionPost(post.id)}
          >
            Thích
          </Button>
          <Button
            type="text"
            icon={<FaComment />}
            className="!text-gray-400"
            onClick={() => setIsCommentOpen((prev: boolean) => !prev)}
          >
            Bình luận
          </Button>
          <Button
            type="text"
            icon={<FaShare />}
            className="!text-gray-400"
            onClick={() =>
              handleCopyLink(`http://localhost:5173/post/${post.id}`)
            }
          >
            Chia sẻ
          </Button>
        </div>

        {/* Comments */}
        {isCommentOpen && (
          <Comment
            postId={post.id}
            comments={post.comments}
            onAddComment={async (
              postId: number,
              content: string,
              parentId?: number | null
            ) => {
              try {
                await postService.addComment(postId, content, parentId);
                loadPosts();
              } catch (error) {
                console.error("Error adding comment:", error);
                message.error("Không thể thêm bình luận. Vui lòng thử lại!");
              }
            }}
          />
        )}
      </Card>
    </>
  );
};

export default Post;
