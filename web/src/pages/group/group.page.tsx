import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import groupService from "../../services/groupService";
import { GroupResponse } from "../../types/api";
import Title from "antd/es/typography/Title";

const GroupPage: React.FC = () => {
  const { id } = useParams();
  const [groupInfo, setGroupInfo] = useState<GroupResponse | undefined>();
  const fetchGroupInfo = async () => {
    const response = await groupService.getGroupInfo(id);
    setGroupInfo(response);
  };

  useEffect(() => {
    fetchGroupInfo();
  }, []);
  return (
    <div className="bg-gray-300 h-full">
      <div className="flex flex-col h-full bg-white max-w-6xl mx-auto">
        {/* Cover Image */}
        <div className="relative w-full h-90 bg-gray-200 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
          <img
            src={groupInfo?.coverImageUrl}
            alt="Group Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-6">
          <Title level={2} className="!mb-1">
            {groupInfo?.name || "Tên nhóm"}
          </Title>
          <div className="text-gray-500 mb-2 text-lg">
            <span>
              {groupInfo?.groupStatus === "PRIVATE"
                ? "Nhóm riêng tư"
                : "Nhóm công khai"}{" "}
            </span>
            ·{" "}
            <span className="font-semibold">
              {groupInfo?.members?.length} thành viên
            </span>
          </div>
        </div>

        {/* <Tabs
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
      /> */}
      </div>
    </div>
  );
};

export default GroupPage;
