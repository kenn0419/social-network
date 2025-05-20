package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Notification;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.enums.NotificationType;
import com.kenn.social_network.exception.AuthorizationException;
import com.kenn.social_network.exception.NotificationNotFoundException;
import com.kenn.social_network.repository.NotificationRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void respondFriendRequestNotification(User sender, User receiver, NotificationType notificationType) {
        Notification notification = Notification.builder()
                .sender(sender)
                .receiver(receiver)
                .url("/profile/" + sender.getId())
                .isRead(false)
                .type(notificationType)
                .build();

        if (notificationType == NotificationType.FRIEND_REQUEST) {
            notification.setContent(sender.getFirstName() + " " + sender.getLastName() + " sent a friend request.");
        }else {
            notification.setContent(sender.getFirstName() + " " + sender.getLastName() + " accept your friend request.");
        }

        notificationRepository.save(notification);

        NotificationResponse notificationResponse = NotificationResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .url(notification.getUrl())
                .isRead(notification.isRead())
                .type(notification.getType())
                .senderName(sender.getFirstName() + " " + sender.getLastName())
                .senderAvatarUrl(sender.getAvatarUrl())
                .createdAt(notification.getCreatedAt())
                .build();
        
        try {
            String destination = "/user/" + receiver.getId() + "/queue/notifications";
            simpMessagingTemplate.convertAndSend(destination, notificationResponse);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<NotificationResponse> fetchAllNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Notification> notifications = notificationRepository.findAllByReceiver(currentUser);

        return notifications.stream().map(notification -> NotificationResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .url(notification.getUrl())
                .isRead(notification.isRead())
                .type(notification.getType())
                .senderName(notification.getSender().getFirstName() + " " + notification.getSender().getLastName())
                .senderAvatarUrl(notification.getSender().getAvatarUrl())
                .createdAt(notification.getCreatedAt())
                .build()).toList();
    }

    @Override
    public void markNotificationAsRead(Long notificationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getReceiver().equals(currentUser)) {
            throw new AuthorizationException("You don't have permission to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllNotificationsAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Notification> notifications = notificationRepository.findAllByReceiverAndIsReadFalse(currentUser);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        if (!notification.getReceiver().equals(currentUser)) {
            throw new AuthorizationException("You don't have permission to delete this notification");
        }

        notificationRepository.delete(notification);
    }
}
