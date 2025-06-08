import React, { useState } from "react";
import { Layout, Breadcrumb, Row, Col } from "antd";
import { GroupCreationRequest } from "../../types/api";
import GroupCreationForm from "../../components/group/create_group_form.component";
import GroupPreview from "../../components/group/create_group_preview.component";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

export interface GroupCreationFormData extends GroupCreationRequest {
  coverImageUrl: string;
}
const GroupCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GroupCreationFormData>({
    name: "",
    groupStatus: "PRIVATE",
    description: "",
    memberIds: [],
    coverImage: undefined,
    coverImageUrl: "",
  });

  const handleFormChange = (newFormData: GroupCreationFormData) => {
    setFormData(newFormData);
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="p-6">
        <Breadcrumb
          className="mb-4 text-sm text-gray-600"
          items={[
            {
              key: "1",
              title: "Nhóm",
              onClick: () => navigate(`/manage-groups`),
              className: "cursor-pointer",
            },
            {
              key: "2",
              title: "Tạo nhóm",
            },
          ]}
        />

        <h1 className="text-2xl font-bold mb-6">Tạo nhóm</h1>

        <Row gutter={[24, 24]} className="flex flex-wrap lg:flex-nowrap">
          <Col xs={24} lg={8}>
            <div className="bg-white p-6 rounded-lg shadow">
              <GroupCreationForm
                formData={formData}
                onFormDataChange={handleFormChange}
              />
            </div>
          </Col>
          <Col xs={24} lg={16}>
            <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
              <GroupPreview formData={formData} />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default GroupCreationPage;
