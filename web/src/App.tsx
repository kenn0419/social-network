import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "./store";
import Login from "./pages/login.page";
import Register from "./pages/register.page";
import MainLayout from "./components/layout/MainLayout";
import { useEffect, useState } from "react";
import { fetchCurrentUser } from "./store/slices/authSlice";
import SearchPage from "./pages/search.page";
import Feed from "./components/feed/Feed";
import Call from "./components/call/Call";
import Profile from "./components/profile/Profile";
import VerifySuccess from "./pages/verify_success.page";
import FriendPage from "./pages/friend.page";
import socketService from "./services/socketService";
import Chat from "./pages/chat.page";

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    }
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
        {/* <Route path="chat" element={<Chat />} /> */}
        <Route path="call" element={<Call />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="*" element={<Feed />} />
      </Route>
      <Route
        path="/friends"
        element={isAuthenticated ? <FriendPage /> : <Navigate to="/login" />}
      />
      <Route path="/verify-success" element={<VerifySuccess />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
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
