import { RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "./store";
import { fetchCurrentUser } from "./store/slices/authSlice";
import socketService from "./services/socketService";
import { notification } from "antd";
import { routes } from "./Router";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const friends = useSelector((state: RootState) => state.friend.friends);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      console.error("Fetch user failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const friendRequestSocket = async () => {
    const client = await socketService.connect();
    try {
      client?.subscribe("/user/queue/friend-request", (message) => {
        const data = JSON.parse(message.body);
        notification.info({
          message: "Friend Request",
          description: data,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendSocket = async () => {
    const client = await socketService.connect();
    try {
      client?.subscribe("/user/queue/respond", (message) => {
        const data = JSON.parse(message.body);
        notification.info({
          message: "Accept Friend Request",
          description: data,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const postSocket = async () => {
    const client = await socketService.connect();
    try {
      client?.subscribe("/user/queue/post", (message) => {
        const data = JSON.parse(message.body);
        notification.info({
          message: "Your friend posted a new post",
          description: data,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const groupSocket = async () => {
    const client = await socketService.connect();
    try {
      client?.subscribe("/user/queue/notifications", (message) => {
        const data = JSON.parse(message.body);
        notification.info({
          message: "🔔 Group Notification",
          description: data.content || "Bạn đã được thêm vào nhóm mới!",
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (user != null) {
        setTimeout(() => {
          socketService.subscribeToStatusUpdates(
            user?.id,
            friends.map((f) => f.userResponse.id)
          );
        }, 1000);
      }
      friendRequestSocket();
      acceptFriendSocket();
      postSocket();
      groupSocket();
    }
  }, [isAuthenticated]);

  if (isLoading) return <div>Loading...</div>;

  return <RouterProvider router={routes} />;
};

export default App;
