import { Layout, Avatar, Button, Dropdown } from "antd";
import {
  FaBell,
  FaFacebookMessenger,
  FaUser,
  FaSignOutAlt,
  // FaHome,
  // FaUsers,
  // FaVideo,
  FaFacebook,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { useState } from "react";
import { RiAdminLine } from "react-icons/ri";
import { RootState, useAppSelector } from "../../store";
import authService from "../../services/authService";
import { logout } from "../../store/slices/authSlice";
import SearchBar from "../../components/search/search.component";
import NotificationPanel from "../../components/notifications/notification_panel.component";

const { Header: AntHeader } = Layout;

// const navIcons = [
//   {
//     icon: <FaHome className="text-2xl" />,
//     active: true,
//   },
//   {
//     icon: <FaUsers className="text-2xl" />,
//     active: false,
//   },
//   {
//     icon: <FaVideo className="text-2xl" />,
//     active: false,
//   },
// ];

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    navigate("/login");
  };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <FaUser />,
      label: "Trang cá nhân",
      onClick: () => navigate(`/profile/${user?.id}`),
      className: "hover:bg-[#f0f2f5]",
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            key: "dashboard",
            icon: <RiAdminLine />,
            label: "Trang quản trị",
            onClick: () => navigate(`/admin`),
            className: "hover:bg-[#f0f2f5]",
          },
        ]
      : []),
    {
      key: "logout",
      icon: <FaSignOutAlt />,
      label: "Đăng xuất",
      onClick: handleLogout,
      className: "hover:bg-[#f0f2f5]",
    },
  ];

  return (
    <AntHeader className="bg-white border-b border-[#e4e6eb] h-[60px] flex items-center fixed top-0 left-0 right-0 z-50 !px-4">
      <div className="flex flex-row items-center w-full max-w-[1920px] mx-auto justify-between h-full">
        {/* Section 1: Logo + Search */}
        <div className="flex flex-row items-center gap-2 min-w-[320px] w-[320px]">
          <div className="flex items-center justify-center gap-2">
            <Link to={`/`}>
              <FaFacebook size={45} />
            </Link>
            <SearchBar />
          </div>
        </div>
        {/* Section 2: Navigation */}
        {/* <div className="h-full flex flex-row items-center flex-1 justify-center gap-1">
          {navIcons.map((item, idx) => (
            <Button
              key={idx}
              type="text"
              className={`h-16 w-16 flex items-center justify-center rounded-lg transition-all text-gray-600 ${
                item.active
                  ? "bg-white border-b-4 border-[#1877f2] text-[#1877f2]"
                  : "hover:bg-[#f0f2f5]"
              }`}
            >
              {item.icon}
            </Button>
          ))}
        </div> */}
        {/* Section 3: Notification, Message, Account */}
        <div className="flex flex-row items-center gap-4 min-w-[220px] justify-end w-[320px]">
          <Button
            type="text"
            className="!py-6 flex items-center justify-center !rounded-full !bg-[#f0f2f5] text-gray-600"
            onClick={() => navigate("/chat")}
          >
            <FaFacebookMessenger size={24} />
          </Button>
          <Dropdown
            open={open}
            onOpenChange={setOpen}
            dropdownRender={() => (
              <NotificationPanel onClose={() => setOpen(false)} />
            )}
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >
            <Button
              type="text"
              className="!py-6 flex items-center justify-center !rounded-full !bg-[#f0f2f5] text-gray-600"
            >
              <FaBell size={24} />
            </Button>
          </Dropdown>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Avatar
              src={user?.avatarUrl}
              icon={<FaUser />}
              className="cursor-pointer border border-[#e4e6eb] hover:opacity-80"
              size={38}
            />
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
