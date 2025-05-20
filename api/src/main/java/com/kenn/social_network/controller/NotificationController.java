package com.kenn.social_network.controller;


import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notification")
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
}
