import { Layout } from "antd";
import { RootState, useAppSelector } from "../../store";
import NotPermissionPage from "../../pages/error/not_permission.page";
import { Outlet } from "react-router-dom";
import MenuLayout from "./menu.layout";

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!user || user.role !== "ADMIN") {
    return <NotPermissionPage />;
  }

  return (
    <Layout className="min-h-screen">
      <MenuLayout />
      <Layout>
        <Content className="pl-3 pt-2 bg-[#f5f5f5]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
