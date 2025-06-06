package com.kenn.social_network.dto.response.notification;

import com.kenn.social_network.enums.NotificationTypeEnum;
import lombok.Builder;
import lombok.Getter;

import java.sql.Timestamp;

@Getter
@Builder
public class NotificationResponse {
    private Long id;

    private String content;

    private String url;

    private boolean isRead;

    private NotificationTypeEnum type;

    private String senderName;

    private String senderAvatarUrl;

    private Timestamp createdAt;
}

