import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

interface Chat {
  id: number;
  participants: {
    id: number;
    name: string;
    avatar: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    fetchChatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchChatsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateUnreadCount: (
      state,
      action: PayloadAction<{ chatId: number; count: number }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.unreadCount = action.payload.count;
      }
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setCurrentChat,
  addMessage,
  updateUnreadCount,
} = chatSlice.actions;
export default chatSlice.reducer;
