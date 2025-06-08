import React, { useEffect, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import groupService from "../../services/groupService";
import { GroupResponse } from "../../types/api";
import { Button, Dropdown, MenuProps, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const ManageGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupResponse[]>([]);

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <FaPlus />,
      label: "Tạo nhóm mới",
      onClick: () => navigate(`/group/create`),
      className: "hover:bg-[#f0f2f5]",
    },
  ];

  const fetchAllGroups = async () => {
    const response = await groupService.getAllGroups();
    setGroups(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);
  return (
    <div className="w-[800px] mx-auto mt-10 bg-white rounded-xl shadow-md p-0">
      <div className="font-semibold text-[20px] px-6 pt-5 pb-2.5 flex justify-between">
        Nhóm
        <Dropdown menu={{ items }} placement="bottomRight">
          <Button
            type="text"
            className="!py-6 flex items-center justify-center !rounded-full !bg-[#f0f2f5] text-gray-600"
          >
            <IoMdSettings size={24} />
          </Button>
        </Dropdown>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Spin />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center text-[#888] py-8">
          Không tìm thấy nhóm nào.
        </div>
      ) : (
        <div>
          {groups?.map((group) => (
            <div
              key={group.id}
              className="flex items-center px-6 py-[14px] border-b border-[#f0f0f0] bg-white transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <img
                src={group.profileImageUrl}
                alt={group.name}
                className="w-11 h-11 rounded-full mr-4 object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="font-medium text-[16px]">{group.name}</div>
                <div className="text-[#888] text-[14px]">
                  {group.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageGroupPage;
