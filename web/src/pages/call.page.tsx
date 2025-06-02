import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Client, IMessage } from "@stomp/stompjs";
import Peer, { Instance } from "simple-peer";
import { Button, message, Tooltip } from "antd";
import callService from "../services/callService";
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
  userId: string;
  stompClientRef: React.MutableRefObject<Client | null>;
  onCallStart: () => void;
  onCallEnd: () => void;
}

const Call: React.FC<CallProps> = ({
  userId,
  stompClientRef,
  onCallStart,
  onCallEnd,
}) => {
  const { callId } = useParams<{ callId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const remoteUserId =
    searchParams.get("callerId") || searchParams.get("receiverId");
  const isInitiator = searchParams.get("initiator") === "true";

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenShareStreamRef = useRef<MediaStream | null>(null);

  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [callSetupCompleted, setCallSetupCompleted] = useState(false);

  const handleEndCall = useCallback(() => {
    console.log("Ending call...");

    // Gửi thông báo kết thúc cuộc gọi
    if (callId && stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: "/app/call.end",
        body: JSON.stringify({ callId }),
      });
    }

    // Dọn dẹp tài nguyên
    if (peerRef.current) {
      peerRef.current.destroy();
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

    onCallEnd();
    navigate("/chat", { replace: true });
  }, [callId, stompClientRef, navigate, onCallEnd]);

  // Thiết lập cuộc gọi
  useEffect(() => {
    if (!callId || !remoteUserId) {
      message.error("Thông tin cuộc gọi không hợp lệ");
      handleEndCall();
      return;
    }

    onCallStart();
    let mediaStream: MediaStream | null = null;
    let callClient: Client | null = null;
    let peer: Instance | null = null;

    const setupCall = async () => {
      try {
        // 1. Kiểm tra và lấy quyền truy cập media
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = mediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          console.error("Media access error:", error);
          message.error(
            "Yêu cầu quyền truy cập camera và micro để thực hiện cuộc gọi"
          );
          throw error;
        }

        // 2. Thiết lập kết nối WebSocket cho cuộc gọi
        try {
          callClient = await callService.initCallConnection(userId);
          stompClientRef.current = callClient;
        } catch (error) {
          console.error("WebSocket connection error:", error);
          message.error("Không thể kết nối dịch vụ gọi điện");
          throw error;
        }

        // 3. Thiết lập peer connection
        peer = new Peer({
          initiator: isInitiator,
          trickle: true,
          stream: mediaStream,
        });
        peerRef.current = peer;

        // Xử lý sự kiện peer connection
        peer.on("signal", (data: any) => {
          if (!callClient?.connected) {
            console.warn("WebSocket not connected, cannot send signal");
            return;
          }

          if (data.type === "offer" || data.type === "answer") {
            callClient.publish({
              destination: "/app/webrtc.sdp",
              body: JSON.stringify({
                type: data.type,
                sdp: data.sdp,
                callId,
                targetUserId: remoteUserId,
              }),
            });
          } else if (data.candidate) {
            callClient.publish({
              destination: "/app/webrtc.ice",
              body: JSON.stringify({
                sdpMid: data.sdpMid,
                sdpMLineIndex: data.sdpMLineIndex,
                candidate: data.candidate,
                callId,
                targetUserId: remoteUserId,
              }),
            });
          }
        });

        peer.on("stream", (remoteStream) => {
          console.log("Received remote stream");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setIsPeerConnected(true);
            message.success("Kết nối thành công!");
          }
        });

        peer.on("connect", () => {
          console.log("Peer connection established");
          setIsPeerConnected(true);
          setCallSetupCompleted(true);
        });

        peer.on("error", (err) => {
          console.error("Peer connection error:", err);
          message.error(`Lỗi kết nối: ${err.message}`);
          handleEndCall();
        });

        peer.on("close", () => {
          console.log("Peer connection closed");
          handleEndCall();
        });

        // Subscribe các kênh WebSocket
        const sdpSub = callClient.subscribe(
          `/user/${userId}/queue/webrtc.sdp`,
          (msg: IMessage) => {
            const data: SdpMessage = JSON.parse(msg.body);
            if (data.callId === callId && peerRef.current) {
              peerRef.current.signal(data);
            }
          }
        );

        const iceSub = callClient.subscribe(
          `/user/${userId}/queue/webrtc.ice`,
          (msg: IMessage) => {
            const data: IceCandidateMessage = JSON.parse(msg.body);
            if (data.callId === callId && peerRef.current) {
              peerRef.current.signal(data);
            }
          }
        );

        const endedSub = callClient.subscribe(
          `/user/${userId}/queue/call.ended`,
          (msg: IMessage) => {
            const data = JSON.parse(msg.body);
            if (data.callId === callId) {
              message.info("Cuộc gọi đã kết thúc từ phía đối phương");
              handleEndCall();
            }
          }
        );

        // Thiết lập timeout cho quá trình kết nối
        const connectionTimeout = setTimeout(() => {
          if (!isPeerConnected) {
            message.warning("Đang gặp khó khăn khi thiết lập kết nối...");
          }
        }, 10000);

        return () => {
          clearTimeout(connectionTimeout);
          sdpSub.unsubscribe();
          iceSub.unsubscribe();
          endedSub.unsubscribe();
        };
      } catch (error) {
        console.error("Call setup failed:", error);
        handleEndCall();
      }
    };

    setupCall();

    return () => {
      console.log("Cleaning up call resources");
      handleEndCall();
    };
  }, [
    callId,
    remoteUserId,
    isInitiator,
    userId,
    stompClientRef,
    handleEndCall,
    onCallStart,
  ]);

  // Các hàm điều khiển media (giữ nguyên)
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !track.enabled));
      setMicMuted(!micMuted);
      message.info(`Mic đã ${micMuted ? "bật" : "tắt"}`);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !track.enabled));
      setVideoOff(!videoOff);
      message.info(`Video đã ${videoOff ? "bật" : "tắt"}`);
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setSpeakerMuted(!speakerMuted);
      message.info(`Loa đã ${speakerMuted ? "bật" : "tắt"}`);
    }
  };

  const toggleScreenShare = async () => {
    if (!peerRef.current || !localStreamRef.current) return;

    if (isSharingScreen) {
      // Dừng chia sẻ màn hình
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        screenShareStreamRef.current = null;
      }

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        peerRef.current.replaceTrack(
          peerRef.current.streams[0].getVideoTracks()[0],
          videoTrack,
          localStreamRef.current
        );
      }

      setIsSharingScreen(false);
      message.info("Đã dừng chia sẻ màn hình");
    } else {
      try {
        message.loading("Đang chuẩn bị chia sẻ màn hình...", 0);
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        message.destroy();

        screenShareStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];

        if (localStreamRef.current.getVideoTracks()[0]) {
          peerRef.current.replaceTrack(
            localStreamRef.current.getVideoTracks()[0],
            videoTrack,
            localStreamRef.current
          );
        }

        videoTrack.onended = () => {
          if (isSharingScreen) toggleScreenShare();
        };

        setIsSharingScreen(true);
        message.success("Đang chia sẻ màn hình");
      } catch (error) {
        message.destroy();
        console.error("Screen share error:", error);
        message.error("Không thể chia sẻ màn hình");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          {isPeerConnected
            ? "Cuộc gọi đang diễn ra"
            : callSetupCompleted
            ? "Đang chờ phản hồi..."
            : "Đang thiết lập cuộc gọi..."}
        </h1>

        <div className="relative w-full max-w-4xl bg-gray-800 rounded-lg shadow-2xl overflow-hidden aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />

          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-md shadow-lg border-2 border-gray-600 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 p-4 bg-gray-800 rounded-lg shadow-xl">
          <Tooltip title={micMuted ? "Bật mic" : "Tắt mic"}>
            <Button
              shape="circle"
              size="large"
              icon={micMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
              onClick={toggleMic}
              className={
                micMuted ? "bg-red-600 text-white" : "bg-gray-700 text-gray-100"
              }
            />
          </Tooltip>

          <Tooltip title={videoOff ? "Bật video" : "Tắt video"}>
            <Button
              shape="circle"
              size="large"
              icon={videoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
              onClick={toggleVideo}
              className={
                videoOff ? "bg-red-600 text-white" : "bg-gray-700 text-gray-100"
              }
            />
          </Tooltip>

          <Tooltip title={speakerMuted ? "Bật loa" : "Tắt loa"}>
            <Button
              shape="circle"
              size="large"
              icon={
                speakerMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />
              }
              onClick={toggleSpeaker}
              className={
                speakerMuted
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }
            />
          </Tooltip>

          <Tooltip
            title={isSharingScreen ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
          >
            <Button
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
              className={
                isSharingScreen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }
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
              className="!bg-red-500 hover:!bg-red-600"
            />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default Call;
