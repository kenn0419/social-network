package com.kenn.social_network.dto.request.message;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {

    private Long receiverId;

    private String content;
}
