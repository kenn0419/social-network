package com.kenn.social_network.controller;


import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    SuccessResponse<List<NotificationResponse>> getAllNotifications() {
        return SuccessResponse.<List<NotificationResponse>>builder()
                .message("Get all notification successfully!!!")
                .data(notificationService.fetchAllNotifications())
                .build();
    }

    @PutMapping("/read-all")
    SuccessResponse<Void> markAllNotificationsAsRead() {
        notificationService.markAllNotificationsAsRead();

        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Marked all notification as read!!!")
                .build();
    }

    @PatchMapping("/{notificationId}/read")
    SuccessResponse<Void> markNotificationAsRead(@PathVariable("notificationId") Long notificationId) {
        notificationService.markNotificationAsRead(notificationId);

        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Marked notification as read!!!")
                .build();
    }

    @DeleteMapping("/{notificationId}")
    SuccessResponse<Void> deleteNotification(@PathVariable("notificationId") Long notificationId) {
        notificationService.deleteNotification(notificationId);

        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Delete notification successfully!!!")
                .build();
    }
}
