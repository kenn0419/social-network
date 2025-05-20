import { useState, useCallback } from "react";
import { Avatar, Button, Input, Spin } from "antd";
import dayjs from "dayjs";
import type { CommentResponse } from "../../types/api";
import postService from "../../services/postService";
import { FaUser } from "react-icons/fa";

interface CommentProps {
  comments: CommentResponse[];
  postId: number;
  onAddComment: (
    postId: number,
    content: string,
    parentId?: number | null
  ) => void;
}

const Comment: React.FC<CommentProps> = ({
  comments,
  postId,
  onAddComment,
}) => {
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [replies, setReplies] = useState<{ [key: number]: CommentResponse[] }>(
    {}
  );
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: number]: boolean;
  }>({});

  const fetchReplies = async (commentId: number) => {
    const response = await postService.getReplies(commentId);
    return response;
  };

  const handleShowReplies = async (commentId: number) => {
    if (replies[commentId]) {
      setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
      return;
    }
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    const res = await fetchReplies(commentId);
    setReplies((prev) => ({ ...prev, [commentId]: res }));
    setShowReplies((prev) => ({ ...prev, [commentId]: true }));
    setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
  };

  const handleAddReply = useCallback(
    (commentId: number) => {
      if (replyText.trim()) {
        onAddComment(postId, replyText, commentId);
        setReplyText("");
        setReplyingId(null);
      }
    },
    [postId, replyText, onAddComment]
  );

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      onAddComment(postId, newComment);
      setNewComment("");
    }
  }, [postId, newComment, onAddComment]);

  const handleReplyTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setReplyText(e.target.value);
    },
    []
  );

  const handleNewCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewComment(e.target.value);
    },
    []
  );

  const CommentItem = ({
    comment,
    level = 0,
  }: {
    comment: CommentResponse;
    level?: number;
  }) => {
    const isReplying = replyingId === comment.id;
    return (
      <div
        className={`flex gap-2 mb-2 ${
          level > 0 ? "ml-10 border-l border-gray-200 pl-4" : ""
        }`}
      >
        <Avatar size={32} icon={<FaUser />} />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-xl px-3 py-2 inline-block">
            <span className="font-semibold text-black text-[15px]">
              {comment.commenter.firstName} {comment.commenter.lastName}
            </span>
            <div className="text-black text-[15px] whitespace-pre-line">
              {comment.content}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}</span>
            <Button
              type="link"
              size="small"
              className="!p-0 !h-auto !text-xs hover:underline"
            >
              Thích
            </Button>
            <Button
              type="link"
              size="small"
              className="!p-0 !h-auto !text-xs hover:underline"
              onClick={() => {
                setReplyingId(comment.id);
                setReplyText("");
              }}
            >
              Phản hồi
            </Button>
          </div>
          {isReplying && level === 0 && (
            <div className="flex gap-2 mt-2 items-center">
              <Input
                size="middle"
                value={replyText}
                onChange={handleReplyTextChange}
                placeholder="Viết phản hồi..."
                className="!rounded-full"
                autoFocus
              />
              <Button
                size="middle"
                type="primary"
                onClick={() => handleAddReply(comment.id)}
              >
                Gửi
              </Button>
            </div>
          )}
          {/* Nút xem replies */}
          {comment.replyCount > 0 && (
            <div className="mt-2">
              <Button
                type="link"
                size="small"
                className="!p-0 !h-auto !text-xs hover:underline"
                onClick={() => handleShowReplies(comment.id)}
              >
                {showReplies[comment.id]
                  ? "Ẩn phản hồi"
                  : `Xem tất cả ${comment.replyCount} phản hồi`}
              </Button>
              {loadingReplies[comment.id] && <Spin size="small" />}
              {showReplies[comment.id] && replies[comment.id] && (
                <div>
                  {replies[comment.id].map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {comments
        .filter((comment) => comment.parentId == 0)
        .map((comment) => (
          <CommentItem key={comment.id} comment={comment} level={0} />
        ))}
      {replyingId === null && (
        <div className="flex gap-2 items-center mt-3">
          <Avatar size={32} icon={<FaUser />} />
          <Input
            size="large"
            value={newComment}
            onChange={handleNewCommentChange}
            placeholder="Viết bình luận..."
            className="!rounded-full"
          />
          <Button type="primary" onClick={handleAddComment}>
            Gửi
          </Button>
        </div>
      )}
    </div>
  );
};

export default Comment;
