import axiosInstance from "../axios_customize";
import {
  ProfileResponse,
  UpdateProfileRequest,
  UserResponse,
  UserSearchRequest,
  UserSearchResponse,
} from "../types/api";

const userService = {
  searchUser: async (query: UserSearchRequest): Promise<UserSearchResponse> => {
    const response = await axiosInstance.get<UserSearchResponse>(
      `/api/v1/users?pageNo=${query.pageNo}&pageSize=${query.pageSize}&search=${query.search}`
    );
    return response.data;
  },
  getProfile: async (userId: string): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `/api/v1/users/profile/${userId}`
    );
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const formData = new FormData();
    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.avatar) formData.append("avatar", data.avatar);

    const response = await axiosInstance.put<UserResponse>(
      "/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  follow: async (userId: number): Promise<void> => {
    await axiosInstance.post(`/users/${userId}/follow`);
  },

  unfollow: async (userId: number): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}/follow`);
  },

  getFollowers: async (userId: number): Promise<UserResponse[]> => {
    const response = await axiosInstance.get<UserResponse[]>(
      `/users/${userId}/followers`
    );
    return response.data;
  },

  getFollowing: async (userId: number): Promise<UserResponse[]> => {
    const response = await axiosInstance.get<UserResponse[]>(
      `/users/${userId}/following`
    );
    return response.data;
  },

  toggleFriend: async (userId: number): Promise<void> => {
    await axiosInstance.post(`/api/v1/users/${userId}/toggle-friend`);
  },
};

export default userService;
