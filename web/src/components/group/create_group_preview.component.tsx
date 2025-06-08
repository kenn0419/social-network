import React from "react";
import { Tabs, Typography } from "antd";
import { GroupCreationFormData } from "../../pages/group/create_group.page";

const { Title, Paragraph } = Typography; // Thêm Paragraph

interface GroupPreviewProps {
  formData: GroupCreationFormData;
}

const GroupPreview: React.FC<GroupPreviewProps> = ({ formData }) => {
  const groupStatusText =
    formData.groupStatus === "PRIVATE" ? "Nhóm Riêng tư" : "Nhóm Công khai";
  const memberCount =
    formData.memberIds && formData.memberIds.length > 0
      ? formData.memberIds.length
      : 1;

  return (
    <div className="flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative w-full h-90 bg-gray-200 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
        {formData.coverImageUrl ? (
          <img
            src={formData.coverImageUrl}
            alt="Group Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Không có ảnh bìa</span>
        )}
      </div>

      <Title level={2} className="mt-0 mb-2">
        {formData.name || "Tên nhóm"}
      </Title>
      <div className="text-sm text-gray-500 mb-2">
        {groupStatusText} · {memberCount} thành viên
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Giới thiệu",
            children: formData.description && (
              <Paragraph className="text-gray-700 mb-6 line-clamp-3">
                {formData.description}
              </Paragraph>
            ),
          },
          {
            key: "2",
            label: "Bài viết",
          },
          {
            key: "3",
            label: "Thành viên",
          },
          {
            key: "4",
            label: "Sự kiện",
          },
        ]}
        className="flex-grow"
      />
    </div>
  );
};

export default GroupPreview;
