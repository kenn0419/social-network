package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.Notification;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.notification.NotificationResponse;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toNotificationResponse(Notification notification, User currentUser) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .url(notification.getUrl())
                .isRead(notification.isRead())
                .type(notification.getType())
                .senderName(currentUser.getFirstName() + " " + currentUser.getLastName())
                .senderAvatarUrl(currentUser.getAvatarUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
