import axiosInstance from "../axios_customize";
import {
  PostResponse,
  CreatePostRequest,
  CommentResponse,
  PageResponse,
  SearchRequest,
} from "../types/api";

const postService = {
  async getAllPosts(query: SearchRequest): Promise<PageResponse<PostResponse>> {
    const response = await axiosInstance.get<PageResponse<PostResponse>>(
      `/api/v1/posts?pageNo=${query.pageNo}&pageSize=${query.pageSize}&search=${query.search}&sort=${query.sort}`
    );

    return response.data;
  },
  async getAllPersonalPosts(userId: number): Promise<PostResponse[]> {
    const response = await axiosInstance.get<PostResponse[]>(
      `/api/v1/posts/current/${userId}`
    );
    return response.data;
  },
  async getPostById(postId: number): Promise<PostResponse> {
    const response = await axiosInstance.get<PostResponse>(
      `/api/v1/posts/${postId}`
    );
    return response.data;
  },
  async getAllGroupPosts(groupId: number): Promise<PostResponse[]> {
    const response = await axiosInstance.get<PostResponse[]>(
      `api/v1/posts/group/${groupId}`
    );

    return response.data;
  },
  async createPost(data: CreatePostRequest): Promise<PostResponse> {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("postType", data.postType);
    if (data.groupId) {
      formData.append("groupId", data.groupId.toString());
    }

    // Append all media files (both images and videos) to mediaFiles array
    data.mediaFiles.forEach((file: File) => {
      formData.append("mediaFiles", file);
    });

    const response = await axiosInstance.post<PostResponse>(
      "/api/v1/posts",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async actionPost(postId: number): Promise<void> {
    await axiosInstance.post(`/api/v1/posts/${postId}/action`);
  },

  async deletePost(postId: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/posts/${postId}`);
  },

  async getComments(postId: number): Promise<CommentResponse[]> {
    const response = await axiosInstance.get<CommentResponse[]>(
      `/api/v1/posts/${postId}/comments`
    );
    return response.data;
  },
  async getReplies(commentId: number): Promise<CommentResponse[]> {
    const response = await axiosInstance.get<CommentResponse[]>(
      `/api/v1/comments/${commentId}/replies`
    );
    return response.data;
  },

  async addComment(
    postId: number,
    comment: string,
    parentId?: number | null
  ): Promise<CommentResponse> {
    const response = await axiosInstance.post<CommentResponse>(
      `/api/v1/comments/posts/${postId}`,
      { comment, parentId }
    );
    return response.data;
  },

  async deleteComment(postId: number, commentId: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/posts/${postId}/comments/${commentId}`);
  },
};

export default postService;
