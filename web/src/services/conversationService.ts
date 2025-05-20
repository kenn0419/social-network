import axiosInstance from "../axios-customize";

const conversationService = {
  getConversations: async () => {
    const res = await axiosInstance.get("/api/v1/conversations");
    return res.data;
  },
};

export default conversationService;
