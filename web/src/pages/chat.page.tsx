import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlusCircle, FiSearch } from "react-icons/fi";
import { useAppSelector } from "../store";
import Chat from "../components/chat/chat.component";
import {
  MessageResponse,
  UserResponse,
  ConversationResponse,
} from "../types/api";
import messageService from "../services/messageService";
import conversationService from "../services/conversationService";
import { Avatar, Button, Modal } from "antd";
import { friendService } from "../services/friendService";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");
  const user = useAppSelector((state) => state.auth.user);

  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );
  const [selectedConv, setSelectedConv] = useState<ConversationResponse | null>(
    null
  );
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch friends + conversations
  useEffect(() => {
    const fetchData = async () => {
      const [convs, frs] = await Promise.all([
        conversationService.getConversations(),
        friendService.getAllFriends(),
      ]);
      setConversations(convs);
      setFriends(frs);
    };

    fetchData();
  }, [messages]);

  // Fetch messages when userId changes
  useEffect(() => {
    if (userId && user) {
      const id = parseInt(userId);
      getMessagesFromUser(id);
    } else {
      setMessages([]);
    }
  }, [userId, user]);

  // Set selectedConv automatically when URL changes
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const id = parseInt(userId);
      const conv = conversations.find((c) => c.participant.id === id);
      if (conv) setSelectedConv(conv);
      else setSelectedConv(null);
    }
  }, [userId, conversations]);

  const getMessagesFromUser = async (userId: number) => {
    const response = await messageService.getMessages(userId);
    setMessages(response);
  };

  const handleFriendSelect = (friend: UserResponse) => {
    navigate(`/chat?user=${friend.id}`);
    setIsModalVisible(false);
  };

  // Determine receiver: từ selectedConv hoặc từ friend list
  const receiver =
    selectedConv?.participant ||
    friends.find((f) => f.id === parseInt(userId || "0"));
  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-65px)] bg-gray-100 gap-4 mt-[65px]">
        {/* Sidebar */}
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 flex items-center text-lg justify-between">
            <h2 className="font-bold">Đoạn chat</h2>
            <Button
              className="!border-none"
              onClick={() => setIsModalVisible(true)}
            >
              <FiPlusCircle size={25} />
            </Button>
          </div>
          <div className="relative mx-4 mb-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-full bg-gray-100 focus:outline-none"
              placeholder="Tìm kiếm trên Messenger"
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center px-4 py-2 rounded-lg mb-1 cursor-pointer transition-all ${
                  selectedConv?.participant.id === conv.participant.id
                    ? "bg-[#f0f2f5]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate(`/chat?user=${conv.participant.id}`);
                }}
              >
                <div className="relative">
                  <img
                    src={conv.participant.avatarUrl}
                    alt={
                      conv.participant.firstName +
                      " " +
                      conv.participant.lastName
                    }
                    className="w-10 h-10 rounded-full mr-3 border"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {conv.participant.firstName +
                      " " +
                      conv.participant.lastName}
                  </div>
                  <div className="flex items-center">
                    <span className="whitespace-nowrap text-sm">
                      {conv.lastMessage.sender.id === user.id
                        ? "Bạn"
                        : conv.participant.firstName}
                      :
                    </span>
                    <span className="truncate text-sm">
                      {conv.lastMessage.content}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex">
          {userId && receiver ? (
            <Chat
              currentUser={user}
              receiver={receiver}
              messages={messages}
              setMessages={setMessages}
              getMessagesFromUser={getMessagesFromUser}
            />
          ) : conversations.length > 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
              Hãy chọn một đoạn chat để bắt đầu nhắn tin
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
              Chưa có đoạn hội thoại nào
            </div>
          )}
        </div>

        {/* Modal chọn bạn bè */}
        <Modal
          title="Chọn bạn để bắt đầu chat"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleFriendSelect(friend)}
              >
                <Avatar src={friend.avatarUrl} />
                <div>
                  {friend.firstName} {friend.lastName}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ChatPage;
