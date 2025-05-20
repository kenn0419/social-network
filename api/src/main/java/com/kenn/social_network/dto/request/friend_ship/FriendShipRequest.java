package com.kenn.social_network.dto.request.friend_ship;

import com.kenn.social_network.enums.FriendShipActionStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendShipRequest {
    private long requesterId;

    private FriendShipActionStatus friendShipActionStatus;
}
