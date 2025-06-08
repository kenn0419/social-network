import React, { useEffect, useState } from "react";
import {
  Input,
  Select,
  Button,
  Avatar,
  Typography,
  Upload,
  message,
} from "antd";
import { FaUser, FaLock, FaUpload, FaTimesCircle } from "react-icons/fa";
import TextArea from "antd/es/input/TextArea";
import { GroupCreationFormData } from "../../pages/group/create_group.page";
import { useNavigate } from "react-router-dom";
import { UserResponse } from "../../types/api";
import { friendService } from "../../services/friendService";
import groupService from "../../services/groupService";

const { Option } = Select;
const { Text, Paragraph } = Typography;

interface GroupCreationFormProps {
  formData: GroupCreationFormData;
  onFormDataChange: (data: GroupCreationFormData) => void;
}

const GroupCreationForm: React.FC<GroupCreationFormProps> = ({
  formData,
  onFormDataChange,
}) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  const fetchAllFriends = async () => {
    const response = await friendService.getAllFriends();
    setFriends(response);
  };

  const handleChange = (field: keyof GroupCreationFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleImageUpload = (info: any) => {
    if (info && info.originFileObj) {
      const file = info.originFileObj;
      handleChange("coverImage", file);
      message.success(`${info.name} file selected successfully.`);
    } else {
      handleChange("coverImage", undefined); // Xóa ảnh nếu có lỗi
      message.error(`${info.name} file selection failed.`);
    }
  };

  const handleMemberSelectChange = (value: string[]) => {
    setSelectedFriendIds(value);
    handleChange(
      "memberIds",
      value.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
    );
  };

  const handleCreateGroup = async () => {
    // Implement API call here, e.g., using FormData for file upload
    const apiFormData = new FormData();
    apiFormData.append("name", formData.name);
    apiFormData.append("description", formData.description);
    apiFormData.append("groupStatus", formData.groupStatus);
    formData.memberIds?.forEach((id) =>
      apiFormData.append("memberIds", id.toString())
    );
    if (formData.coverImage) {
      apiFormData.append("coverImage", formData.coverImage);
    }
    const response = await groupService.createGroup(apiFormData);

    if (response) {
      navigate(`/group/${response.id}`);
    }
  };

  useEffect(() => {
    fetchAllFriends();
  }, []);

  useEffect(() => {
    if (formData.coverImage) {
      const fileUrl = URL.createObjectURL(formData.coverImage);
      handleChange("coverImageUrl", fileUrl);

      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [formData.coverImage]);

  const uploadButton = (
    <div
      className="flex flex-col items-center justify-center py-4 px-6 
    border border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
    >
      <FaUpload className="text-2xl text-gray-500 mb-2" />
      <div className="text-gray-600">Tải ảnh bìa lên</div>
    </div>
  );

  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const friend = friends.find((f) => f.id.toString() === value);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <span
        className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2"
        onMouseDown={onPreventMouseDown}
      >
        <Avatar
          size="small"
          src={friend?.avatarUrl}
          icon={<FaUser />}
          className="mr-1"
        />
        {friend ? friend.firstName + " " + friend.lastName : label}
        {closable && (
          <FaTimesCircle
            className="ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={onClose}
          />
        )}
      </span>
    );
  };

  return (
    <div>
      {/* User Info */}
      <div className="flex items-center mb-6">
        <Avatar size="large" icon={<FaUser />} className="mr-3" />
        <div>
          <Text strong>Bảo Trần</Text>
          <div className="text-sm text-gray-500">Quản trị viên</div>
        </div>
      </div>

      {/* Group Name */}
      <div className="mb-6">
        <Text className="block mb-2 font-medium">Tên nhóm</Text>
        <Input
          placeholder="Tên nhóm"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <Text className="block mb-2 font-medium">
          Mô tả nhóm (không bắt buộc)
        </Text>
        <TextArea
          rows={4}
          placeholder="Viết mô tả về nhóm của bạn..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full resize-y"
        />
      </div>

      {/* Group Status (Privacy) */}
      <div className="mb-6">
        <Text className="block mb-2 font-medium">Chọn quyền riêng tư</Text>
        <Select
          className="w-full"
          value={formData.groupStatus}
          onChange={(value) => handleChange("groupStatus", value as string)} // Giữ là string theo GroupCreationRequest
          suffixIcon={<FaLock />}
        >
          {/* Vẫn nên gợi ý private/public cho người dùng dù type là string */}
          <Option value="PRIVATE">
            <div className="flex items-center">
              <FaLock className="mr-2" /> Riêng tư
            </div>
          </Option>
          <Option value="PUBLIC">
            <div className="flex items-center">
              <FaUser className="mr-2" /> Công khai
            </div>
          </Option>
        </Select>
        {formData.groupStatus === "PRIVATE" && (
          <Paragraph className="mt-2 text-xs text-gray-500">
            Chỉ thành viên mới nhìn thấy mọi người trong nhóm và những gì họ
            đăng. Sau này, bạn không thể thay đổi nhóm thành nhóm công khai.
          </Paragraph>
        )}
      </div>

      <div className="mb-6">
        <Text className="block mb-2 font-medium">
          Mời thành viên (không bắt buộc)
        </Text>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Chọn hoặc nhập tên bạn bè"
          value={selectedFriendIds} // Gắn với state cục bộ selectedFriendIds
          onChange={handleMemberSelectChange}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          tagRender={tagRender}
        >
          {friends.map((friend) => (
            <Option
              key={friend.id.toString()}
              value={friend.id.toString()}
              label={friend.id}
            >
              <div className="flex items-center">
                <Avatar
                  size="small"
                  src={friend.avatarUrl}
                  icon={<FaUser />}
                  className="mr-2"
                />
                {friend.firstName} {friend.lastName}
              </div>
            </Option>
          ))}
        </Select>
        <Paragraph className="mt-2 text-xs text-gray-500">
          Gợi ý:
          <span className="text-gray-700">
            Bạn bè của bạn sẽ hiển thị ở đây.
          </span>
        </Paragraph>
      </div>

      <div className="mb-6">
        <Text className="block mb-2 font-medium">
          Ảnh bìa nhóm (không bắt buộc)
        </Text>
        <Upload
          name="coverImage"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={() => false}
          onChange={(e) => handleImageUpload(e.fileList[0])}
        >
          {uploadButton}
        </Upload>
      </div>

      <Button
        type="primary"
        block
        size="large"
        onClick={handleCreateGroup}
        className="w-full"
      >
        Tạo
      </Button>
    </div>
  );
};

export default GroupCreationForm;
