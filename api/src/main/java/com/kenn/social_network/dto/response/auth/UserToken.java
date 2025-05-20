package com.kenn.social_network.dto.response.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserToken {
    private long id;

    private String email;

    private String role;
}
