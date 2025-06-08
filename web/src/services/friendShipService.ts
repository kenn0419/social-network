import axiosInstance from "../axios_customize";
import { FriendShipResponse } from "../types/api";

const friendShipService = {
  getFriendRequests: async (): Promise<FriendShipResponse[]> => {
    const response = await axiosInstance.get<FriendShipResponse[]>(
      `/api/v1/users/friend-requests`
    );
    return response.data;
  },

  respondFriendRequest: async (
    requesterId: number,
    friendShipActionStatus: string
  ) => {
    await axiosInstance.put<void>(`/api/v1/friend_ship/respond`, {
      requesterId,
      friendShipActionStatus,
    });
  },
};

export default friendShipService;
