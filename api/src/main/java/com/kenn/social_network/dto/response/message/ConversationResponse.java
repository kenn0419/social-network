package com.kenn.social_network.dto.response.message;

import com.kenn.social_network.dto.response.user.UserResponse;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Builder
public class ConversationResponse {
    private Long id;

    private UserResponse participant;

    private MessageResponse lastMessage;

    private Timestamp lastMessageTime;

    private boolean unRead;
} 