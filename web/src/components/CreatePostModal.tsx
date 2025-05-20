import React, { useState } from "react";
import {
  Modal,
  Input,
  Button,
  Upload,
  Avatar,
  Divider,
  message,
  Popover,
} from "antd";
import { FaImage, FaSmile, FaVideo, FaUser, FaTimes } from "react-icons/fa";
import type { UploadFile } from "antd/es/upload/interface";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";

const { TextArea } = Input;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, images: File[], videos: File[]) => void;
  userAvatar?: string;
  userName: string;
  isSubmitting?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userAvatar,
  userName,
  isSubmitting = false,
}) => {
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [videoList, setVideoList] = useState<UploadFile[]>([]);

  const handleSubmit = () => {
    if (!content.trim() && fileList.length === 0 && videoList.length === 0) {
      message.warning("Vui lòng nhập nội dung hoặc thêm ảnh/video");
      return;
    }

    const files = fileList.map((file) => file.originFileObj as File);
    const videos = videoList.map((file) => file.originFileObj as File);
    onSubmit(content, files, videos);
    setContent("");
    setFileList([]);
    setVideoList([]);
    onClose();
  };

  const handleImageUpload = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  const handleVideoUpload = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setVideoList(newFileList);
  };

  const removeImage = (uid: string) => {
    setFileList(fileList.filter((file) => file.uid !== uid));
  };

  const removeVideo = (uid: string) => {
    setVideoList(videoList.filter((file) => file.uid !== uid));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      className="create-post-modal"
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Avatar size={40} src={userAvatar} icon={<FaUser />} />
        <div className="ml-3 flex-1">
          <div className="font-semibold text-[15px]">{userName}</div>
        </div>
        <Button
          type="text"
          icon={<FaTimes />}
          onClick={onClose}
          className="!p-1"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <TextArea
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          bordered={false}
          className="text-[15px] !min-h-[120px]"
        />

        {fileList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {fileList.map((file) => (
              <div
                key={file.uid}
                className="relative w-[100px] h-[100px] rounded-lg overflow-hidden"
              >
                <img
                  src={
                    file.url || URL.createObjectURL(file.originFileObj as Blob)
                  }
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="text"
                  icon={<FaTimes style={{ color: "white" }} />}
                  onClick={() => removeImage(file.uid)}
                  className="absolute top-1 right-1 !p-1 !min-w-[24px] !h-[24px] rounded-full bg-black/50 border-none hover:bg-black/70"
                />
              </div>
            ))}
          </div>
        )}

        {videoList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {videoList.map((file) => (
              <div
                key={file.uid}
                className="relative w-[200px] rounded-lg overflow-hidden"
              >
                <video
                  src={
                    file.url || URL.createObjectURL(file.originFileObj as Blob)
                  }
                  className="w-full rounded-lg"
                  controls
                />
                <Button
                  type="text"
                  icon={<FaTimes style={{ color: "white" }} />}
                  onClick={() => removeVideo(file.uid)}
                  className="absolute top-1 right-1 !p-1 !min-w-[24px] !h-[24px] rounded-full bg-black/50 border-none hover:bg-black/70"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 border-t flex justify-between items-center">
        <div className="text-[15px] text-gray-600">
          Thêm vào bài viết của bạn
        </div>
        <div className="flex gap-2">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleImageUpload}
            multiple
          >
            <Button
              icon={<FaImage />}
              className="flex items-center gap-2 h-9 rounded-md font-medium hover:bg-gray-100"
            >
              Ảnh
            </Button>
          </Upload>
          <Upload
            accept="video/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleVideoUpload}
            multiple
          >
            <Button
              icon={<FaVideo />}
              className="flex items-center gap-2 h-9 rounded-md font-medium hover:bg-gray-100"
            >
              Video
            </Button>
          </Upload>
          <Popover
            content={<EmojiPicker onEmojiClick={onEmojiClick} />}
            trigger="click"
            placement="topRight"
          >
            <Button
              icon={<FaSmile />}
              className="flex items-center gap-2 h-9 rounded-md font-medium hover:bg-gray-100"
            >
              Cảm xúc
            </Button>
          </Popover>
        </div>
      </div>

      <Divider className="!my-0" />

      {/* Footer */}
      <div className="p-4 text-right">
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          disabled={
            (!content.trim() &&
              fileList.length === 0 &&
              videoList.length === 0) ||
            isSubmitting
          }
          loading={isSubmitting}
          className="!rounded-md !font-medium !min-w-[100px]"
        >
          Đăng
        </Button>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
