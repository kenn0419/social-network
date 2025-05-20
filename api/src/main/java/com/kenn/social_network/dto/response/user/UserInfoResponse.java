package com.kenn.social_network.dto.response.user;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {

    private long id;

    private String firstName;

    private String lastName;

    private String email;

    private String avatarUrl;
}
