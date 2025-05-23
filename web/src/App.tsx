import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "./store";
import Login from "./pages/login.page";
import Register from "./pages/register.page";
import MainLayout from "./components/layout/MainLayout";
import { useEffect, useRef, useState } from "react";
import { fetchCurrentUser } from "./store/slices/authSlice";
import SearchPage from "./pages/search.page";
import Feed from "./components/feed/Feed";
import Profile from "./components/profile/Profile";
import VerifySuccess from "./pages/verify_success.page";
import FriendPage from "./pages/friend.page";
import socketService from "./services/socketService";
import Chat from "./pages/chat.page";
import { Button, message, Modal } from "antd";
import { Client } from "@stomp/stompjs";
import Call from "./pages/call.page";

interface StompSubscription {
  id: string;
  unsubscribe: (headers?: { [key: string]: string }) => void;
}

const AppContent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user: currentUser } = useSelector(
    (state: RootState) => state.auth
  );

  // useRef để lưu trữ instance của STOMP Client
  const stompClientRef = useRef<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // ---
  // Effect để fetch thông tin người dùng hiện tại khi ứng dụng khởi động
  useEffect(() => {
    const initAuth = async () => {
      // Chỉ fetch nếu chưa được xác thực (hoặc khi refresh trang)
      if (!isAuthenticated) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          // Xử lý lỗi fetch user (ví dụ: token hết hạn), có thể redirect về login
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false); // Nếu đã xác thực, tắt loading ngay
      }
    };
    initAuth();
  }, [dispatch, isAuthenticated]);

  // ---
  // Effect để quản lý kết nối socketService toàn cục
  // Kết nối khi người dùng được xác thực, ngắt kết nối khi không còn xác thực
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log("AppContent: Initializing socketService connection...");
      const client = socketService.connect();
      if (client == null) {
        return;
      }
      // Gán instance client vào ref để có thể truy cập nó từ các hàm khác
      stompClientRef.current = client;

      // Optional: Đặt một callback onConnect nếu bạn muốn thực hiện hành động ngay sau khi kết nối thành công
      // Lưu ý: client.onConnect chỉ chạy một lần khi kết nối được thiết lập ban đầu
      if (client && !client.onConnect) {
        // Tránh ghi đè nếu đã có handler ở nơi khác
        client.onConnect = () => {
          console.log("AppContent: STOMP client connected and ready!");
          // Ví dụ: gửi trạng thái online của người dùng
        };
      }
    } else {
      console.log("AppContent: Disconnecting socketService...");
      socketService.disconnect();
      stompClientRef.current = null; // Đảm bảo ref được reset khi ngắt kết nối
    }

    // Cleanup function: Đảm bảo ngắt kết nối khi component unmount
    return () => {
      // Chỉ ngắt kết nối nếu client đang tồn tại và kết nối đang hoạt động
      // Điều này ngăn việc ngắt kết nối đột ngột nếu socketService được dùng ở nơi khác
      if (stompClientRef.current?.connected) {
        console.log(
          "AppContent: Disconnecting socketService on cleanup (if still connected)."
        );
        socketService.disconnect();
        stompClientRef.current = null; // Xóa ref sau khi ngắt kết nối
      }
    };
  }, [isAuthenticated, currentUser]); // Dependencies quan trọng: isAuthenticated và currentUser thay đổi

  // ---
  // Effect để đăng ký các subscriptions xử lý cuộc gọi
  useEffect(() => {
    let incomingCallSubscription: StompSubscription | undefined;
    let outgoingCallSubscription: StompSubscription | undefined;
    let callAcceptedSubscription: StompSubscription | undefined;
    let callEndedSubscription: StompSubscription | undefined;

    const stompClient = stompClientRef.current; // Lấy client từ ref

    // Chỉ thực hiện subscriptions khi đã xác thực, có currentUser và client đã kết nối
    if (
      isAuthenticated &&
      currentUser &&
      stompClient &&
      stompClient.connected
    ) {
      console.log(
        "AppContent: Subscribing to call channels for user:",
        currentUser.id
      );

      // Subscribe to incoming calls
      incomingCallSubscription = stompClient.subscribe(
        `/user/${currentUser.id}/queue/call.incoming`,
        (messagePayload) => {
          const payload = JSON.parse(messagePayload.body);
          console.log("Incoming call:", payload);
          setIncomingCall(payload);
        }
      );

      // Subscribe to outgoing call status (for caller)
      outgoingCallSubscription = stompClient.subscribe(
        `/user/${currentUser.id}/queue/call.outgoing`,
        (messagePayload) => {
          const payload = JSON.parse(messagePayload.body);
          console.log("Outgoing call status:", payload);
          if (payload.status === "ACCEPTED") {
            message.success(
              `Cuộc gọi đến ${payload.receiverId} đã được chấp nhận!`
            );
            // Điều hướng người gọi đến trang cuộc gọi chính thức
            navigate(
              `/call/${payload.callId}?receiverId=${payload.receiverId}&initiator=true`
            );
          } else if (payload.status === "REJECTED") {
            message.error(`Cuộc gọi đến ${payload.receiverId} đã bị từ chối.`);
            // Đóng bất kỳ UI "đang gọi" nào ở người gọi nếu có
          }
        }
      );

      // Subscribe to call accepted for receiver (self-confirmation)
      callAcceptedSubscription = stompClient.subscribe(
        `/user/${currentUser.id}/queue/call.accepted`,
        (messagePayload) => {
          const payload = JSON.parse(messagePayload.body);
          console.log("Call accepted (self-confirmation):", payload);
          setIncomingCall(null); // Đóng modal cuộc gọi đến
          // Điều hướng người nhận. Truyền callerId và initiator=false cho CallPage
          navigate(
            `/call/${payload.callId}?callerId=${payload.callerId}&initiator=false`
          );
        }
      );

      // Subscribe to call ended (for both caller and receiver)
      callEndedSubscription = stompClient.subscribe(
        `/user/${currentUser.id}/queue/call.ended`,
        (messagePayload) => {
          const payload = JSON.parse(messagePayload.body);
          console.log("Call ended:", payload);
          message.info(`Cuộc gọi đã kết thúc.`);
          // Đóng mọi UI liên quan đến cuộc gọi và có thể điều hướng về trang chat
          if (window.location.pathname.startsWith("/call")) {
            navigate("/chat"); // Hoặc trang chủ
          }
        }
      );

      // Cleanup function: Hủy đăng ký tất cả các subscriptions khi component unmount hoặc dependencies thay đổi
      return () => {
        console.log("AppContent: Unsubscribing from call channels.");
        incomingCallSubscription?.unsubscribe();
        outgoingCallSubscription?.unsubscribe();
        callAcceptedSubscription?.unsubscribe();
        callEndedSubscription?.unsubscribe();
      };
    } else {
      console.log(
        "AppContent: Skipping call subscriptions (not authenticated, no user, or client not connected)."
      );
    }
  }, [
    isAuthenticated,
    currentUser,
    navigate,
    stompClientRef.current?.connected,
  ]); // Thêm stompClientRef.current?.connected vào dependencies

  // ---
  // Hàm xử lý khi người nhận chấp nhận cuộc gọi
  const handleAcceptCall = () => {
    if (incomingCall) {
      const stompClient = stompClientRef.current; // Lấy client từ ref
      // Kiểm tra xem client có tồn tại và đã kết nối không
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/call.accept",
          body: JSON.stringify({ callId: incomingCall.callId }),
        });
        setIncomingCall(null); // Đóng modal ngay lập tức
      } else {
        message.error(
          "Không thể chấp nhận cuộc gọi. Kết nối WebSocket không sẵn sàng."
        );
        console.error("STOMP client not connected for accept call.");
      }
    }
  };

  // ---
  // Hàm xử lý khi người nhận từ chối cuộc gọi
  const handleRejectCall = () => {
    if (incomingCall) {
      const stompClient = stompClientRef.current; // Lấy client từ ref
      // Kiểm tra xem client có tồn tại và đã kết nối không
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/call.reject",
          body: JSON.stringify({ callId: incomingCall.callId }),
        });
        setIncomingCall(null); // Đóng modal
      } else {
        message.error(
          "Không thể từ chối cuộc gọi. Kết nối WebSocket không sẵn sàng."
        );
        console.error("STOMP client not connected for reject call.");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Feed />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route
            path="/call/:callId"
            element={
              currentUser ? (
                // Truyền trực tiếp client instance, không phải ref object
                <Call
                  userId={currentUser.id.toString()}
                  stompClientRef={stompClientRef}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Feed />} />
        </Route>
        <Route
          path="/friends"
          element={isAuthenticated ? <FriendPage /> : <Navigate to="/login" />}
        />
        <Route path="/verify-success" element={<VerifySuccess />} />
        {/* Trang chat */}
        <Route path="/chat" element={<Chat />} />
      </Routes>

      {/* Modal hiển thị cuộc gọi đến */}
      <Modal
        title="Cuộc gọi đến"
        open={!!incomingCall} // Chỉ hiển thị khi incomingCall có giá trị
        onCancel={() => setIncomingCall(null)} // Cho phép đóng modal bằng cách nhấn Esc hoặc nút X
        footer={[
          <Button key="reject" onClick={handleRejectCall} danger>
            Từ chối
          </Button>,
          <Button key="accept" type="primary" onClick={handleAcceptCall}>
            Chấp nhận
          </Button>,
        ]}
      >
        <p>Bạn có cuộc gọi đến từ **{incomingCall?.callerName}**</p>
      </Modal>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
