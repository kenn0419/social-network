import { Layout } from "antd";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const isHome = path === "/";
  const isNoSidebar =
    path === "/search" ||
    path === "/chat" ||
    path === "/call" ||
    /^\/profile\//.test(path);

  return (
    <Layout className="min-h-screen bg-white">
      <Header />
      <div
        className={`flex flex-row justify-between w-full mx-auto gap-x-4 pt-[60px] bg-white ${
          isHome ? "max-w-[1920px]" : "max-w-[1100px]"
        }`}
      >
        {/* Sidebar trái */}
        {isHome && (
          <div className="hidden lg:block flex-shrink-0 w-[400px] bg-white">
            <div className="sticky top-[60px] h-[calc(100vh-60px)]">
              <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden pr-2">
                <SidebarLeft />
              </div>
            </div>
          </div>
        )}
        {/* Content */}
        <main
          className={`flex-1 flex flex-col items-center w-full min-h-[calc(100vh-60px)] ${
            isHome ? "max-w-[680px]" : "max-w-[1100px]"
          }`}
        >
          <Content className="w-full">
            <Outlet />
          </Content>
        </main>
        {/* Sidebar phải */}
        {isHome && (
          <div className="hidden xl:block flex-shrink-0 w-[380px]">
            <div className="sticky top-[60px] h-[calc(100vh-60px)]">
              <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden pr-2">
                <SidebarRight />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MainLayout;
