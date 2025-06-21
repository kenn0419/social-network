package com.kenn.social_network.dto.response.user;

import com.kenn.social_network.enums.FriendshipStatusEnum;
import com.kenn.social_network.enums.UserStatusEnum;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserResponse {
    private long id;

    private String firstName;

    private String lastName;

    private String email;

    private String address;

    private String avatarUrl;

    private String coverUrl;

    private String bio;

    private String role;

    private UserStatusEnum status;

    private FriendshipStatusEnum friendshipStatus;
}
