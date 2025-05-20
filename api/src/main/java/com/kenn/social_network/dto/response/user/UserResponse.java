package com.kenn.social_network.dto.response.user;

import com.kenn.social_network.enums.FriendshipStatus;
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

    private FriendshipStatus friendshipStatus;
}
