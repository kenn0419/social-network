import { Layout, Menu, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import { RootState } from "../../store";
import { GroupResponse } from "../../types/api";
import groupService from "../../services/groupService";

const { Sider } = Layout;

const IconFB = ({
  position,
  size = 36,
}: {
  position: string;
  size?: number;
}) => (
  <span
    className={`inline-block align-middle rounded-full bg-no-repeat bg-[length:auto] mr-3`}
    style={{
      backgroundImage:
        "url(https://static.xx.fbcdn.net/rsrc.php/v4/yH/r/i2HLlWiS1Fa.png)",
      backgroundPosition: position,
      width: size,
      height: size,
    }}
  />
);

const SidebarLeft: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [groups, setGroups] = useState<GroupResponse[]>([]);

  const fetchAllGroups = async () => {
    const response = await groupService.getAllGroupsOfUser();
    setGroups(response.data.splice(0, 3));
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const menuItems = [
    {
      key: "profile",
      icon: (
        <Avatar
          size={36}
          src={user?.avatarUrl ? user.avatarUrl : undefined}
          icon={<FaUser />}
          className="bg-white"
        />
      ),
      label: (
        <span className="text-black font-semibold text-base">
          {user?.firstName + " " + user?.lastName}
        </span>
      ),
      onClick: () => navigate(`/profile/${user?.id}`),
    },
    {
      key: "friends",
      icon: <IconFB position="0px -296px" />, // Bạn bè
      label: <span className="text-gray-800 text-[15px]">Bạn bè</span>,
      onClick: () => navigate("/friends"),
    },
    {
      key: "groups",
      icon: <IconFB position="0px -37px" />, // Nhóm
      label: <span className="text-gray-800 text-[15px]">Nhóm</span>,
      onClick: () => navigate("/manage-groups"),
    },
    {
      key: "video",
      icon: <IconFB position="0px -518px" />, // Video
      label: <span className="text-gray-800 text-[15px]">Video</span>,
      onClick: () => navigate("/watch"),
    },
  ];

  return (
    <Sider
      width={400}
      className="bg-white h-full px-2 pt-4 border-r border-[#e4e6eb]"
    >
      <Menu
        mode="inline"
        className="bg-white border-none text-[15px] [&_.ant-menu-item]:flex [&_.ant-menu-item]:items-center [&_.ant-menu-item]:gap-3 [&_.ant-menu-item]:hover:bg-[#f0f2f5] [&_.ant-menu-item]:rounded-lg"
        items={menuItems}
        selectable={false}
        style={{
          marginBottom: 8,
          marginLeft: 0,
          marginRight: 0,
          fontSize: 18,
          fontWeight: 600,
        }}
      />
      <div className="border-t border-[#e4e6eb] my-3"></div>
      <div className="px-2">
        <div className="text-gray-700 text-[17px] font-semibold mb-2 mt-2">
          Lối tắt của bạn
        </div>
        <Menu
          mode="inline"
          className="bg-white border-none text-[15px] [&_.ant-menu-item]:flex [&_.ant-menu-item]:items-center [&_.ant-menu-item]:gap-3 [&_.ant-menu-item]:hover:bg-[#f0f2f5] [&_.ant-menu-item]:rounded-lg"
          items={groups.map((g) => ({
            key: g.id,
            icon: (
              <img src={g.coverImageUrl} className="w-10 h-10 rounded-full" />
            ),
            label: (
              <span className="text-gray-800 !text-base !font-semibold">
                {g.name}
              </span>
            ),
          }))}
          selectable={false}
          onClick={(info) => {
            const group = groups.find(
              (group) => group.id.toString() === info.key
            );
            if (group) {
              navigate(`/group/${group.id}`);
            }
          }}
        />
      </div>
    </Sider>
  );
};

export default SidebarLeft;
