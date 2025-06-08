import axiosInstance from "../axios_customize";

const conversationService = {
  getConversations: async () => {
    const res = await axiosInstance.get("/api/v1/conversations");
    return res.data;
  },
};

export default conversationService;
