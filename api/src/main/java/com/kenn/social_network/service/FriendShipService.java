package com.kenn.social_network.service;

import com.kenn.social_network.dto.request.friend_ship.FriendShipRequest;
import com.kenn.social_network.dto.response.friend_ship.FriendShipResponse;
import com.kenn.social_network.dto.response.user.FriendWithStatusResponse;
import com.kenn.social_network.dto.response.user.UserResponse;

import java.util.List;

public interface FriendShipService {

    void changeFriendShipStatus(long userId);

    List<FriendShipResponse> fetchAllFriendShipRequest();

    List<UserResponse> fetchAllFriends();

    void respondFriendRequest(FriendShipRequest friendShipRequest);

    List<FriendWithStatusResponse> fetchAllFriendsWithStatus();
}
