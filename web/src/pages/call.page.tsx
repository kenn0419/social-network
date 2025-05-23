import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Client, IMessage } from "@stomp/stompjs";
import Peer, { Instance } from "simple-peer";
import { Button, message, Tooltip } from "antd";
import {
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import Header from "../components/layout/Header";

// Định nghĩa types cho SDP và ICE Candidates
interface SdpMessage {
  type: RTCSdpType;
  sdp: string;
  callId: string;
  targetUserId: string;
}

interface IceCandidateMessage {
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  candidate: string;
  callId: string;
  targetUserId: string;
}

interface CallProps {
  userId: string; // ID của người dùng hiện tại
  stompClientRef: React.MutableRefObject<Client | null>;
}

const Call: React.FC<CallProps> = ({ userId, stompClientRef }) => {
  const { callId } = useParams<{ callId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const remoteUserId = searchParams.get("callerId"); // Người còn lại trong cuộc gọi
  const isInitiator = searchParams.get("initiator") === "true"; // True nếu là người gọi đầu tiên

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenShareStreamRef = useRef<MediaStream | null>(null); // Để lưu trữ luồng chia sẻ màn hình

  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false); // Trạng thái tắt tiếng loa của video từ xa
  const [isSharingScreen, setIsSharingScreen] = useState(false); // Trạng thái chia sẻ màn hình
  const [isPeerConnected, setIsPeerConnected] = useState(false); // Trạng thái kết nối peer

  // Hàm để kết thúc cuộc gọi và dọn dẹp tài nguyên
  const handleEndCall = useCallback(() => {
    console.log("Ending call...");
    if (
      stompClientRef.current &&
      stompClientRef.current.active &&
      callId &&
      remoteUserId
    ) {
      stompClientRef.current.publish({
        destination: "/app/call.end",
        body: JSON.stringify({
          callId: callId,
          // otherParticipantId is not strictly needed on backend if callId is enough to find participants
          // but keeping it for clarity if needed.
          // In WebSocketController.java, we extract the current user and use callId to find the other.
        }),
      });
    }

    if (peerRef.current) {
      peerRef.current.destroy(); // Quan trọng: Giải phóng tài nguyên WebRTC
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
    }

    // Điều hướng về trang chat sau khi kết thúc. Sử dụng replace để không lưu vào lịch sử.
    navigate("/chat", { replace: true });
  }, [callId, remoteUserId, stompClientRef, navigate]);

  // Setup Peer Connection
  useEffect(() => {
    if (
      !callId ||
      !remoteUserId ||
      !stompClientRef.current ||
      !stompClientRef.current.active
    ) {
      message.error(
        "Thông tin cuộc gọi không hợp lệ hoặc kết nối WebSocket chưa sẵn sàng. Đang quay lại trang chat."
      );
      handleEndCall(); // Điều hướng về trang chat
      return;
    }

    const stompClient = stompClientRef.current;
    let localStream: MediaStream | null = null; // Biến cục bộ để quản lý stream ban đầu

    const setupPeer = async () => {
      try {
        message.loading("Đang yêu cầu quyền truy cập camera và micro...", 0); // Hiển thị loading
        // Lấy luồng media cục bộ (camera và mic)
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        message.destroy(); // Tắt loading
        message.success("Đã truy cập camera và micro thành công!");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        localStreamRef.current = localStream; // Lưu vào ref

        // Xử lý khi local stream bị ngắt kết nối (ví dụ: rút camera, tắt mic)
        localStream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            console.log("Local video track ended.");
            message.warning(
              "Video của bạn đã bị ngắt kết nối. Cuộc gọi sẽ kết thúc."
            );
            handleEndCall();
          };
        });
        localStream.getAudioTracks().forEach((track) => {
          track.onended = () => {
            console.log("Local audio track ended.");
            message.warning(
              "Micro của bạn đã bị ngắt kết nối. Cuộc gọi sẽ kết thúc."
            );
            handleEndCall();
          };
        });

        // Tạo Peer connection
        const peer = new Peer({
          initiator: isInitiator,
          trickle: true,
          stream: localStream,
        });

        peerRef.current = peer;

        // Gửi SDP Offer/Answer và ICE Candidates qua WebSocket
        peer.on("signal", (data: any) => {
          if (!stompClient || !stompClient.active) {
            console.warn("STOMP client not active, cannot send signal data.");
            return;
          }

          if (data.type === "offer" || data.type === "answer") {
            const sdpPayload: SdpMessage = {
              type: data.type,
              sdp: data.sdp,
              callId: callId,
              targetUserId: remoteUserId!,
            };
            stompClient.publish({
              destination: "/app/webrtc.sdp",
              body: JSON.stringify(sdpPayload),
            });
          } else if (data.candidate) {
            const icePayload: IceCandidateMessage = {
              sdpMid: data.sdpMid,
              sdpMLineIndex: data.sdpMLineIndex,
              candidate: data.candidate,
              callId: callId,
              targetUserId: remoteUserId!,
            };
            stompClient.publish({
              destination: "/app/webrtc.ice",
              body: JSON.stringify(icePayload),
            });
          }
        });

        // Nhận luồng media từ Peer khác
        peer.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            message.success("Đã kết nối với người gọi!");
            setIsPeerConnected(true); // Cập nhật trạng thái đã kết nối
          }
        });

        peer.on("connect", () => {
          console.log("Peer connection established!");
          setIsPeerConnected(true);
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          message.error("Lỗi cuộc gọi: " + err.message);
          handleEndCall();
        });

        peer.on("close", () => {
          console.log("Peer connection closed.");
          message.info("Cuộc gọi đã kết thúc.");
          setIsPeerConnected(false);
          handleEndCall();
        });
      } catch (error) {
        message.destroy(); // Tắt loading nếu có
        console.error(
          "Lỗi khi truy cập thiết bị media hoặc thiết lập cuộc gọi:",
          error
        );
        message.error(
          "Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền và thử lại."
        );
        handleEndCall();
      }
    };

    setupPeer();

    // Lắng nghe SDP và ICE candidates từ WebSocket
    const sdpSubscription = stompClient.subscribe(
      `/user/${userId}/queue/webrtc.sdp`,
      (msg: IMessage) => {
        const sdpData: SdpMessage = JSON.parse(msg.body);
        if (sdpData.callId === callId && peerRef.current) {
          console.log("Received SDP from remote:", sdpData.type);
          peerRef.current.signal(sdpData);
        }
      }
    );

    const iceSubscription = stompClient.subscribe(
      `/user/${userId}/queue/webrtc.ice`,
      (msg: IMessage) => {
        const iceData: IceCandidateMessage = JSON.parse(msg.body);
        if (iceData.callId === callId && peerRef.current) {
          console.log("Received ICE candidate from remote:", iceData.candidate);
          peerRef.current.signal(iceData);
        }
      }
    );

    // Lắng nghe sự kiện cuộc gọi kết thúc từ bên kia
    const callEndedSubscription = stompClient.subscribe(
      `/user/${userId}/queue/call.ended`,
      (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        if (data.callId === callId) {
          message.info(
            `Cuộc gọi đã kết thúc bởi ${data.endedByUser || "người khác"}.`
          );
          handleEndCall();
        }
      }
    );

    // Cleanup function
    return () => {
      console.log("Call component unmounting, cleaning up resources.");
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        screenShareStreamRef.current = null;
      }
      if (stompClient.connected) {
        sdpSubscription.unsubscribe();
        iceSubscription.unsubscribe();
        callEndedSubscription.unsubscribe();
      }
      message.destroy();
    };
  }, [
    callId,
    remoteUserId,
    isInitiator,
    userId,
    stompClientRef,
    handleEndCall,
  ]);

  // Functions for media controls
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setMicMuted((prev) => !prev);
        message.info(`Mic đã ${micMuted ? "bật" : "tắt"}`);
      } else {
        message.error("Không tìm thấy track âm thanh cục bộ.");
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setVideoOff((prev) => !prev);
        message.info(`Video đã ${videoOff ? "bật" : "tắt"}`);
      } else {
        message.error("Không tìm thấy track video cục bộ.");
      }
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setSpeakerMuted((prev) => !prev);
      message.info(`Loa đã ${speakerMuted ? "bật" : "tắt"}`);
    }
  };

  const toggleScreenShare = async () => {
    if (!peerRef.current || !localStreamRef.current) {
      message.error("Kết nối cuộc gọi chưa sẵn sàng.");
      return;
    }

    if (isSharingScreen) {
      // Dừng chia sẻ màn hình
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        screenShareStreamRef.current = null;
      }
      // Thay thế track video bằng track camera cũ
      const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (
        peerRef.current.streams[0] &&
        peerRef.current.streams[0].getVideoTracks()[0] &&
        currentVideoTrack
      ) {
        peerRef.current.replaceTrack(
          peerRef.current.streams[0].getVideoTracks()[0],
          currentVideoTrack,
          localStreamRef.current
        );
      } else {
        message.error(
          "Không thể khôi phục camera. Vui lòng kiểm tra lại thiết bị."
        );
      }
      setIsSharingScreen(false);
      message.info("Đã dừng chia sẻ màn hình.");
    } else {
      // Bắt đầu chia sẻ màn hình
      try {
        message.loading("Đang yêu cầu quyền chia sẻ màn hình...", 0);
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        message.destroy();
        message.success("Đã bắt đầu chia sẻ màn hình của bạn!");

        screenShareStreamRef.current = screenStream;

        // Thay thế track video hiện tại của peer với track màn hình
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStreamRef.current.getVideoTracks()[0]) {
          // Ensure camera track exists
          peerRef.current.replaceTrack(
            localStreamRef.current.getVideoTracks()[0], // Track camera hiện tại
            videoTrack, // Track màn hình mới
            localStreamRef.current // Luồng gốc của track camera (quan trọng để peer biết luồng nào đang được cập nhật)
          );
        } else {
          // Nếu không có track video camera, chỉ thêm track màn hình
          peerRef.current.addTrack(videoTrack, screenStream);
        }

        // Khi chia sẻ màn hình dừng (ví dụ: người dùng tắt qua trình duyệt), quay lại camera
        screenStream.getVideoTracks()[0].onended = () => {
          console.log("Screen share ended by user.");
          if (isSharingScreen) {
            // Chỉ gọi nếu đang chia sẻ để tránh lỗi vòng lặp
            toggleScreenShare(); // Gọi lại hàm để dừng chia sẻ và quay lại camera
          }
        };

        setIsSharingScreen(true);
      } catch (err) {
        message.destroy();
        console.error("Lỗi khi chia sẻ màn hình:", err);
        message.error("Không thể chia sẻ màn hình. Vui lòng kiểm tra quyền.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          {isPeerConnected ? "Cuộc gọi đang diễn ra" : "Đang chờ kết nối..."}
        </h1>

        <div className="relative w-full max-w-4xl bg-gray-800 rounded-lg shadow-2xl overflow-hidden aspect-video">
          {/* Remote Video (video của người khác) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          ></video>

          {/* Local Video (video của bạn) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-md shadow-lg border-2 border-gray-600 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted // Muted cho video của chính bạn để tránh tiếng vọng
              playsInline
              className="w-full h-full object-cover"
            ></video>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 p-4 bg-gray-800 rounded-lg shadow-xl">
          <Tooltip title={micMuted ? "Bật mic" : "Tắt mic"}>
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={micMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
              onClick={toggleMic}
              className={`transition-colors duration-200 ${
                micMuted
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
            />
          </Tooltip>

          <Tooltip title={videoOff ? "Bật video" : "Tắt video"}>
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={videoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
              onClick={toggleVideo}
              className={`transition-colors duration-200 ${
                videoOff
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
            />
          </Tooltip>

          <Tooltip title={speakerMuted ? "Bật loa" : "Tắt loa"}>
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={
                speakerMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />
              }
              onClick={toggleSpeaker}
              className={`transition-colors duration-200 ${
                speakerMuted
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
            />
          </Tooltip>

          <Tooltip
            title={
              isSharingScreen ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"
            }
          >
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={
                isSharingScreen ? (
                  <MdOutlineStopScreenShare size={24} />
                ) : (
                  <MdOutlineScreenShare size={24} />
                )
              }
              onClick={toggleScreenShare}
              className={`transition-colors duration-200 ${
                isSharingScreen
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100"
              }`}
            />
          </Tooltip>

          <Tooltip title="Kết thúc cuộc gọi">
            <Button
              type="primary"
              danger
              shape="circle"
              size="large"
              icon={<FiPhoneOff size={24} />}
              onClick={handleEndCall}
              className="!bg-red-500 hover:!bg-red-600 transition-colors duration-200"
            />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default Call;
