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
import { FaImage, FaSmile, FaUser, FaTimes } from "react-icons/fa";
import type { UploadFile } from "antd/es/upload/interface";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";

const { TextArea } = Input;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, mediaFiles: File[]) => void;
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
  const [mediaFiles, setMediaFiles] = useState<UploadFile[]>([]);

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      message.warning("Vui lòng nhập nội dung hoặc thêm ảnh/video");
      return;
    }

    const files = mediaFiles.map((file) => file.originFileObj as File);
    onSubmit(content, files);
    setContent("");
    setMediaFiles([]);
    onClose();
  };

  const handleMediaUpload = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setMediaFiles(newFileList);
  };

  const removeMedia = (uid: string) => {
    setMediaFiles(mediaFiles.filter((file) => file.uid !== uid));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const isImage = (file: UploadFile) => {
    return file.type?.startsWith("image/");
  };

  const isVideo = (file: UploadFile) => {
    return file.type?.startsWith("video/");
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={650}
      centered
      className="create-post-modal"
    >
      {/* Header */}
      <div className="flex items-center p-4">
        <Avatar size={40} src={userAvatar} icon={<FaUser />} />
        <div className="ml-3 flex-1">
          <div className="font-semibold text-[15px]">{userName}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        <TextArea
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoSize={{ minRows: 5, maxRows: 10 }}
          className="text-[15px] !min-h-[120px] !p-3"
        />

        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {mediaFiles.map((file) => (
              <div key={file.uid} className="relative">
                {isImage(file) ? (
                  <div className="w-[100px] h-[100px] rounded-lg overflow-hidden">
                    <img
                      src={
                        file.url ||
                        URL.createObjectURL(file.originFileObj as Blob)
                      }
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : isVideo(file) ? (
                  <div className="w-[200px] rounded-lg overflow-hidden">
                    <video
                      src={
                        file.url ||
                        URL.createObjectURL(file.originFileObj as Blob)
                      }
                      className="w-full rounded-lg"
                      controls
                    />
                  </div>
                ) : null}
                <Button
                  type="text"
                  icon={<FaTimes color="white" />}
                  onClick={() => removeMedia(file.uid)}
                  className="absolute top-1 right-1 !p-1 !min-w-[24px] !h-[24px] rounded-full bg-black/50 border-none hover:bg-black/70"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="text-[15px] text-gray-600">
          Thêm vào bài viết của bạn
        </div>
        <div className="flex gap-2">
          <Upload
            accept="image/*,video/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleMediaUpload}
            multiple
          >
            <Button
              icon={<FaImage />}
              className="flex items-center gap-2 h-9 rounded-md font-medium hover:bg-gray-100"
            >
              Ảnh/Video
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
            (!content.trim() && mediaFiles.length === 0) || isSubmitting
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
