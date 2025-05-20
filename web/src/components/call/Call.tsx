import { Layout, Avatar, Button, Space } from "antd";
import {
  FaUser,
  FaPhone,
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";
import { useState } from "react";

const { Content } = Layout;

interface Call {
  id: number;
  name: string;
  avatar: string;
  type: "audio" | "video";
  status: "calling" | "incoming" | "ongoing";
}

const Call: React.FC = () => {
  const [currentCall, setCurrentCall] = useState<Call>({
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "",
    type: "video",
    status: "ongoing",
  });

  const handleEndCall = () => {
    // Xử lý kết thúc cuộc gọi
    setCurrentCall(null);
  };

  const handleToggleAudio = () => {
    // Xử lý bật/tắt âm thanh
  };

  const handleToggleVideo = () => {
    // Xử lý bật/tắt video
  };

  if (!currentCall) {
    return null;
  }

  return (
    <Layout className="h-screen bg-gray-900">
      <Content className="flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <Avatar size={120} icon={<FaUser />} className="mb-4" />
          <h2 className="text-2xl font-semibold">{currentCall.name}</h2>
          <p className="text-gray-400">
            {currentCall.status === "calling" && "Đang gọi..."}
            {currentCall.status === "incoming" && "Cuộc gọi đến"}
            {currentCall.status === "ongoing" && "Đang gọi"}
          </p>
        </div>

        <div className="flex space-x-4">
          <Button
            shape="circle"
            size="large"
            icon={<FaMicrophone />}
            onClick={handleToggleAudio}
            className="bg-gray-700 hover:bg-gray-600"
          />
          <Button
            shape="circle"
            size="large"
            icon={<FaVideo />}
            onClick={handleToggleVideo}
            className="bg-gray-700 hover:bg-gray-600"
          />
          <Button
            shape="circle"
            size="large"
            icon={<FaPhoneSlash />}
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700"
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Call;
