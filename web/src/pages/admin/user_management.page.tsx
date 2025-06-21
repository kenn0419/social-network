import React, { useRef } from "react";
import {
  ProTable,
  PageContainer,
  ActionType,
} from "@ant-design/pro-components";
import { Avatar, Select } from "antd";
import { PageResponse, UserResponse, SearchRequest } from "../../types/api";
import userService from "../../services/userService";

const UserManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const handleChangeStatus = async (id: number, value: string) => {
    await userService.changeUserStatus(id, value);
    actionRef.current?.reload();
  };
  return (
    <PageContainer>
      <ProTable<UserResponse>
        actionRef={actionRef}
        headerTitle="Danh sách người dùng"
        rowKey="id"
        search={{
          labelWidth: "auto",
          defaultCollapsed: false,
          columns: [
            {
              title: "Tìm kiếm",
              dataIndex: "generalSearch",
              valueType: "text",
              fieldProps: {
                placeholder: "Nhập ID, tên, email...",
              },
              hideInTable: true,
            },
          ],
        }}
        pagination={{
          defaultCurrent: 1,
          pageSizeOptions: ["1", "5", "10", "20", "50"],
          showSizeChanger: true,
        }}
        request={async (params, sort) => {
          let sortBy: string = "id,asc";
          if (sort && Object.keys(sort).length > 0) {
            const field = Object.keys(sort)[0];
            const order = sort[field] === "ascend" ? "asc" : "desc";
            sortBy = `${field},${order}`;
          }

          const query: SearchRequest = {
            pageNo: params.current || 1,
            pageSize: params.pageSize || 10,
            search: params.generalSearch ? params.generalSearch : "",
            sort: sortBy,
          };

          try {
            const response: PageResponse<UserResponse> =
              await userService.getAllUsers(query);
            return {
              data: response.data,
              success: true,
              total: response.totalElements,
            };
          } catch (error) {
            console.error("Fetch users failed:", error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            width: 60,
            sorter: true,
          },
          {
            title: "Avatar",
            dataIndex: "avatarUrl",
            render: (_, record) => (
              <Avatar src={record.avatarUrl} alt="avatar" />
            ),
            width: 80,
            search: false,
            sorter: true,
          },
          {
            title: "Họ",
            dataIndex: "firstName",
            sorter: true,
          },
          {
            title: "Tên",
            dataIndex: "lastName",
            sorter: true,
          },
          {
            title: "Email",
            dataIndex: "email",
            sorter: true,
          },
          {
            title: "Địa chỉ",
            dataIndex: "address",
            sorter: true,
          },
          {
            title: "Vai trò",
            dataIndex: "role",
            filters: true,
            onFilter: true,
            valueEnum: {
              ADMIN: { text: "Admin", status: "Error" },
              USER: { text: "User", status: "Success" },
            },
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (text, record) => (
              <Select
                value={record.status}
                onChange={(value) => handleChangeStatus(record.id, value)}
                style={{ width: 120 }}
                size="small"
                options={[
                  { label: "Hoạt động", value: "ACTIVE" },
                  { label: "Đã khóa", value: "BLOCK" },
                ]}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default UserManagementPage;
