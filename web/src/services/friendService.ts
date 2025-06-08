import axiosInstance from "../axios_customize";
import { UserResponse } from "../types/api";

export interface FriendWithStatus {
  userResponse: UserResponse;
  userPresenceStatus: "ONLINE" | "OFFLINE" | "AWAY" | "BUSY";
  lastActiveAt: string;
}

export const friendService = {
  getFriendsWithStatus: async (): Promise<FriendWithStatus[]> => {
    const response = await axiosInstance.get(`/api/v1/users/friends/presence`);
    return response.data;
  },
  getAllFriends: async (): Promise<UserResponse[]> => {
    const response = await axiosInstance.get<UserResponse[]>(
      `/api/v1/users/friend-list`
    );
    return response.data;
  },
};
