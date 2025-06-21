import Sider from "antd/es/layout/Sider";
import { useNavigate, useLocation } from "react-router-dom";

import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { Menu } from "antd";

const MenuLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    {
      key: "/admin",
      icon: <FaTachometerAlt />,
      label: "Dashboard",
    },
    {
      key: "/admin/manage-users",
      icon: <FaUsers />,
      label: "Quản lý người dùng",
    },
    {
      key: "/admin/manage-posts",
      icon: <FaFileAlt />,
      label: "Quản lý bài đăng",
    },
  ];

  const selectedKey =
    items
      .slice()
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => location.pathname.startsWith(item.key))?.key || "";

  return (
    <Sider
      width={250}
      className="bg-gray-300 border-r !border-gray-200 h-screen"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="text-center p-4 font-bold text-xl text-blue-600 flex items-center gap-4">
        <span
          className="p-3 rounded-full shadow-md hover:bg-gray-300 cursor-pointer"
          onClick={() => navigate(`/`)}
        >
          <FaArrowLeft />
        </span>
        <span>Admin Panel</span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(item) => navigate(item.key)}
        items={items}
      />
    </Sider>
  );
};

export default MenuLayout;
