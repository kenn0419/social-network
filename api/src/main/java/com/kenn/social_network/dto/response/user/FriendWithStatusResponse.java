package com.kenn.social_network.dto.response.user;

import com.kenn.social_network.enums.UserPresenceStatusEnum;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@Builder
public class FriendWithStatusResponse {

    private UserResponse userResponse;

    private UserPresenceStatusEnum userPresenceStatus;

    private Timestamp lastActiveAt;
}
