package com.kenn.social_network.dto.response.auth;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class AuthResponse {
    private User user;

    private String accessToken;

    @Getter
    @Builder
    public static class User {
        private long id;

        private String firstName;

        private String lastName;

        private String email;

        private String avatarUrl;
    }
}
