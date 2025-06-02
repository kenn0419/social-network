package com.kenn.social_network.dto.response.friend_ship;

import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.FriendshipStatusEnum;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FriendShipResponse {

    private UserResponse requester;

    private UserResponse addressee;

    private FriendshipStatusEnum friendshipStatusEnum;
}
