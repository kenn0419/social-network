import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Avatar, Spin } from "antd";
import { FaUser, FaFileAlt } from "react-icons/fa";
import { PageContainer } from "@ant-design/pro-components";
import userService from "../../services/userService";
import postService from "../../services/postService";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const userStats = await userService.getAllUsers({
        pageNo: 0,
        pageSize: 10,
        search: "",
        sort: "id,asc",
      });
      const postStats = await postService.getAllPosts({
        pageNo: 0,
        pageSize: 10,
        search: "",
        sort: "id,asc",
      });
      setLoading(false);

      setTotalUsers(userStats.totalElements);
      setTotalPosts(postStats.totalElements);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  return (
    <PageContainer
      header={{
        title: "Dashboard",
        breadcrumb: {},
      }}
      loading={loading}
    >
      <Spin spinning={loading}>
        <Row gutter={[24, 24]} className="p-4">
          <Col
            xs={24}
            sm={12}
            md={8}
            onClick={() => navigate(`/admin/manage-users`)}
            className="cursor-pointer"
          >
            <Card className="shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <Avatar icon={<FaUser />} size={50} className="bg-blue-500" />
                <div>
                  <Statistic
                    title={<span className="text-gray-600">Total Users</span>}
                    value={totalUsers}
                    valueStyle={{ color: "#1677ff" }}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={8}
            onClick={() => navigate(`/admin/manage-posts`)}
            className="cursor-pointer"
          >
            <Card className="shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <Avatar
                  icon={<FaFileAlt />}
                  size={50}
                  className="bg-purple-500"
                />
                <div>
                  <Statistic
                    title={<span className="text-gray-600">Total Posts</span>}
                    value={totalPosts}
                    valueStyle={{ color: "#9254de" }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  );
};

export default DashboardPage;
