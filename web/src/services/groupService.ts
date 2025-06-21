import axiosInstance from "../axios_customize";
import { GroupResponse, PageResponse } from "../types/api";

const groupService = {
  getAllGroups: async (): Promise<PageResponse<GroupResponse>> => {
    const response = await axiosInstance.get<PageResponse<GroupResponse>>(
      `/api/v1/groups`
    );
    return response.data;
  },
  getAllGroupsOfUser: async (): Promise<PageResponse<GroupResponse>> => {
    const response = await axiosInstance.get<PageResponse<GroupResponse>>(
      `/api/v1/groups/current`
    );
    return response.data;
  },
  createGroup: async (apiFormData: FormData): Promise<GroupResponse> => {
    const response = await axiosInstance.post<GroupResponse>(
      "/api/v1/groups",
      apiFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  getGroupInfo: async (id: string): Promise<GroupResponse> => {
    const response = await axiosInstance.get<GroupResponse>(
      `api/v1/groups/${id}`
    );

    return response.data;
  },
};

export default groupService;
