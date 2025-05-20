package com.kenn.social_network.dto.response.message;

import com.kenn.social_network.dto.response.user.UserResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@Builder
public class MessageResponse {

    private UserResponse sender;

    private UserResponse receiver;

    private String content;

    private Timestamp createdAt;
}
