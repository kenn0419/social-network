export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface FriendShipResponse {
  requester: UserResponse;
  addressee: UserResponse;
  friendshipStatus: string;
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  content: string;
  url: string;
  isRead: boolean;
  senderName: string;
  senderAvatarUrl: string;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  mediaFiles: File[];
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  friendshipStatus?: string | null;
  status?: string;
}

export interface UserSearchResponse {
  data: UserResponse[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: File;
}

export interface UserSearchRequest {
  pageNo: string;
  pageSize: string;
  search: string;
}

export interface ProfileResponse {
  user: UserResponse;
  posts: PostResponse[];
  friends: UserResponse[];
}

export interface PostResponse {
  id: number;
  content: string;
  author: UserResponse;
  postMedia: PostMediaResponse[];
  likeCount: number;
  liked: boolean;
  comments: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PostMediaResponse {
  id: number;
  url: string;
  type: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  commenter: UserResponse;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

export interface MessageResponse {
  id: number;
  content: string;
  sender: UserResponse;
  receiver: UserResponse;
  createdAt: string;
}

export interface ChatResponse {
  id: number;
  participants: UserResponse[];
  lastMessage: MessageResponse;
  unreadCount: number;
}

export interface ConversationResponse {
  id: number;
  participant: UserResponse;
  lastMessage: MessageResponse;
  lastMessageTime: string;
  unreadCount: number;
}

export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  groupStatus: string;
  owner: UserResponse;
  coverImageUrl: string;
  members: UserResponse[];
  posts: PostResponse[];
  createdAt: string;
}

export interface PageResponse<T> {
  pageNo: number;
  pageSize: 10;
  totalPage: 0;
  data: T;
}

export interface GroupCreationRequest {
  name: string;
  description: string;
  groupStatus: string;
  memberIds?: number[];
  coverImage?: File;
}
