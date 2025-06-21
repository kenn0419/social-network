import Login from "./pages/auth/login.page";
import Register from "./pages/auth/register.page";
import FeedPage from "./pages/feed/feed.page";
import SearchPage from "./pages/search/search.page";
import ChatPage from "./pages/chat/chat.page";
import FriendPage from "./pages/friend/friend.page";
import ProfilePage from "./pages/profile/profile.page";
import ManageGroupPage from "./pages/group/manage_group.page";
import CreateGroupPage from "./pages/group/create_group.page";
import GroupPage from "./pages/group/group.page";
import PostPage from "./pages/post/post.page";
import VerifySuccess from "./pages/auth/verify_success.page";
import OAuth2SuccessPage from "./pages/auth/oauth2.page";
import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "./pages/error/not_fount.page";
import MainLayout from "./layout/client/main.layout";
import AdminLayout from "./layout/admin/admin.layout";
import DashboardPage from "./pages/admin/dashboard.page";
import UserManagementPage from "./pages/admin/user_management.page";
import PostManagementPage from "./pages/admin/post_management.page";
import WatchPage from "./pages/watch/WatchPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "friends", element: <FriendPage /> },
      { path: "profile/:id", element: <ProfilePage /> },
      { path: "manage-groups", element: <ManageGroupPage /> },
      { path: "group/create", element: <CreateGroupPage /> },
      { path: "group/:id", element: <GroupPage /> },
      { path: "post/:id", element: <PostPage /> },
      { path: "watch", element: <WatchPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "manage-users", element: <UserManagementPage /> },
      { path: "manage-posts", element: <PostManagementPage /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-success",
    element: <VerifySuccess />,
  },
  {
    path: "/oauth2",
    element: <OAuth2SuccessPage />,
  },
]);
