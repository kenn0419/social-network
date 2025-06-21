import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import React, { useRef } from "react";
import { PageResponse, PostResponse, SearchRequest } from "../../types/api";
import postService from "../../services/postService";
import { Avatar } from "antd";

const PostManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  return (
    <PageContainer>
      <ProTable<PostResponse>
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
            const response: PageResponse<PostResponse> =
              await postService.getAllPosts(query);
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
            dataIndex: "author",
            render: (_, record) => (
              <Avatar src={record.author.avatarUrl} alt="avatar" />
            ),
            width: 80,
            search: false,
            sorter: true,
          },
          {
            title: "Họ",
            dataIndex: "author",
            render: (_, record) => record.author.firstName,
            sorter: true,
          },
          {
            title: "Tên",
            dataIndex: "author",
            render: (_, record) => record.author.lastName,
            sorter: true,
          },
          {
            title: "Content",
            dataIndex: "content",
            sorter: true,
          },
          {
            title: "Likes",
            dataIndex: "likeCount",
            sorter: true,
          },
          {
            title: "Comments",
            dataIndex: "comments",
            render: (_, record) => record.comments.length,
          },
        ]}
      />
    </PageContainer>
  );
};

export default PostManagementPage;
