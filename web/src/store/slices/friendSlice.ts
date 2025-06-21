import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FriendWithStatus } from "../../services/friendService";

interface FriendState {
  friends: FriendWithStatus[];
}

const initialState: FriendState = {
  friends: [],
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<FriendWithStatus[]>) => {
      state.friends = action.payload;
    },
    updateFriendStatus: (
      state,
      action: PayloadAction<{
        userId: number;
        status: string;
        lastActiveAt: string;
      }>
    ) => {
      const { userId, status, lastActiveAt } = action.payload;
      const index = state.friends.findIndex(
        (f) => f.userResponse.id === userId
      );
      if (index !== -1) {
        state.friends[index].userPresenceStatus = status;
        state.friends[index].lastActiveAt = lastActiveAt;
      }
    },
  },
});

export const { setFriends, updateFriendStatus } = friendSlice.actions;
export default friendSlice.reducer;
