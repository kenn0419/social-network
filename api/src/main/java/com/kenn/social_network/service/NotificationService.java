package com.kenn.social_network.service;

import com.kenn.social_network.domain.Group;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.enums.NotificationTypeEnum;

import java.util.List;

public interface NotificationService {

    void respondFriendRequestNotification(User sender, User receiver, NotificationTypeEnum notificationTypeEnum);

    void createPostNotification(Post post);

    void createGroupNotification(Group group);

    List<NotificationResponse> fetchAllNotifications();

    void markNotificationAsRead(Long notificationId);

    void markAllNotificationsAsRead();

    void deleteNotification(Long notificationId);
}
