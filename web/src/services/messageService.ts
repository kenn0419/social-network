import axiosInstance from "../axios_customize";

const messageService = {
  getMessages: async (userId: number) => {
    const res = await axiosInstance.get(`/api/v1/messages/${userId}`);
    return res.data;
  },
  createMessage: async (receiverId: number, content: string) => {
    const res = await axiosInstance.post(`/api/v1/messages`, {
      receiverId,
      content,
    });
    return res.data;
  },
};

export default messageService;
