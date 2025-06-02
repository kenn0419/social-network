import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
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
import callService from "./services/callService";

interface StompSubscription {
  id: string;
  unsubscribe: (headers?: { [key: string]: string }) => void;
}

const AppContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const { isAuthenticated, user: currentUser } = useSelector(
    (state: RootState) => state.auth
  );

  const stompClientRef = useRef<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callActive, setCallActive] = useState(false);

  const initAuth = async () => {
    if (!isAuthenticated) {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      initAuth();
    }
  }, []);

  // Effect để fetch thông tin người dùng
  useEffect(() => {
    initAuth();
  }, [dispatch, isAuthenticated]);

  // Effect quản lý kết nối socket chính
  useEffect(() => {
    if (isAuthenticated && currentUser && !callActive) {
      console.log("Initializing main socket connection...");
      const client = socketService.connect();
      if (client == null) {
        return;
      }
      stompClientRef.current = client;

      return () => {
        if (!callActive) {
          socketService.disconnect();
        }
      };
    }
  }, [isAuthenticated, currentUser, callActive]);

  // Effect quản lý subscriptions cuộc gọi
  useEffect(() => {
    let subscriptions: StompSubscription[] = [];

    const setupCallSubscriptions = async () => {
      if (!isAuthenticated || !currentUser) return;

      try {
        // Sử dụng callService để đảm bảo kết nối
        const client = await callService.initCallConnection(
          currentUser.id.toString()
        );
        stompClientRef.current = client;

        // Subscribe các kênh cuộc gọi
        const incomingSub = client.subscribe(
          `/user/${currentUser.id}/queue/call.incoming`,
          (message) => {
            const payload = JSON.parse(message.body);
            setIncomingCall(payload);
          }
        );

        const outgoingSub = client.subscribe(
          `/user/${currentUser.id}/queue/call.outgoing`,
          (message) => {
            const payload = JSON.parse(message.body);
            if (payload.status === "ACCEPTED") {
              navigate(
                `/call/${payload.callId}?receiverId=${payload.receiverId}&initiator=true`
              );
            }
          }
        );

        const acceptedSub = client.subscribe(
          `/user/${currentUser.id}/queue/call.accepted`,
          (message) => {
            const payload = JSON.parse(message.body);
            setIncomingCall(null);
            navigate(
              `/call/${payload.callId}?callerId=${payload.callerId}&initiator=false`
            );
          }
        );

        const endedSub = client.subscribe(
          `/user/${currentUser.id}/queue/call.ended`,
          (message) => {
            if (window.location.pathname.startsWith("/call")) {
              navigate("/chat");
            }
          }
        );

        subscriptions = [incomingSub, outgoingSub, acceptedSub, endedSub];
      } catch (error) {
        console.error("Failed to setup call subscriptions:", error);
      }
    };

    setupCallSubscriptions();

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
      if (!callActive) {
        callService.cleanup();
      }
    };
  }, [isAuthenticated, currentUser, navigate, callActive]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const client = await callService.initCallConnection(
        currentUser?.id.toString() || ""
      );
      client.publish({
        destination: "/app/call.accept",
        body: JSON.stringify({ callId: incomingCall.callId }),
      });
      setIncomingCall(null);
    } catch (error) {
      message.error("Không thể chấp nhận cuộc gọi");
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      const client = await callService.initCallConnection(
        currentUser?.id.toString() || ""
      );
      client.publish({
        destination: "/app/call.reject",
        body: JSON.stringify({ callId: incomingCall.callId }),
      });
      setIncomingCall(null);
    } catch (error) {
      message.error("Không thể từ chối cuộc gọi");
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
                <Call
                  userId={currentUser.id.toString()}
                  stompClientRef={stompClientRef}
                  onCallStart={() => setCallActive(true)}
                  onCallEnd={() => setCallActive(false)}
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
        <Route path="/chat" element={<Chat />} />
      </Routes>

      <Modal
        title="Cuộc gọi đến"
        open={!!incomingCall}
        onCancel={() => setIncomingCall(null)}
        footer={[
          <Button key="reject" onClick={handleRejectCall} danger>
            Từ chối
          </Button>,
          <Button key="accept" type="primary" onClick={handleAcceptCall}>
            Chấp nhận
          </Button>,
        ]}
      >
        <p>Bạn có cuộc gọi đến từ {incomingCall?.callerName}</p>
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
