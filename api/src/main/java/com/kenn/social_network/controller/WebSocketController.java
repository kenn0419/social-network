package com.kenn.social_network.controller;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import com.kenn.social_network.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.context.event.EventListener;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserPresenceService userPresenceService;
    private final ObjectMapper objectMapper;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String userId = null;
        
        try {
            if (headers.getUser() != null) {
                userId = headers.getUser().getName();
            }
            
            if (userId != null) {
                log.info("User connected with ID: {}", userId);
                
                // Update user presence to ONLINE
                UserPresence userPresence = new UserPresence();
                userPresence.setUserId(Long.parseLong(userId));
                userPresence.setUserPresenceStatus(UserPresenceStatusEnum.ONLINE);
                log.info("Setting user {} status to ONLINE", userId);
                updateStatus(userPresence);
            } else {
                log.warn("Unauthorized WebSocket connection attempt. Headers: {}", headers);
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket connection: {}", e.getMessage(), e);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String userId = null;
        
        try {
            if (headers.getUser() != null) {
                userId = headers.getUser().getName();
            }
            
            if (userId != null) {
                log.info("User disconnected with ID: {}", userId);
                
                // Update user presence to OFFLINE
                UserPresence userPresence = new UserPresence();
                userPresence.setUserId(Long.parseLong(userId));
                userPresence.setUserPresenceStatus(UserPresenceStatusEnum.OFFLINE);
                log.info("Setting user {} status to OFFLINE", userId);
                updateStatus(userPresence);
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket disconnection: {}", e.getMessage(), e);
        }
    }

    @MessageMapping({"/friend-request", "/respond"})
    public void handleFriendRequest(@Payload NotificationResponse notification, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        log.info("Handling friend request for user: {}", userId);
        messagingTemplate.convertAndSendToUser(
            userId,
            "/queue/notifications",
            notification
        );
    }

    @MessageMapping("/status.update")
    @SendTo("/topic/status")
    public UserPresence updateStatus(@Payload UserPresence userPresence) {
        log.info("Updating user status: userId={}, status={}", userPresence.getUserId(), userPresence.getUserPresenceStatus());
        try {
            userPresenceService.updateUserPresence(userPresence.getUserId(), userPresence.getUserPresenceStatus());
            log.info("Successfully updated user status in database");
            return userPresence;
        } catch (Exception e) {
            log.error("Error updating user status: {}", e.getMessage(), e);
            throw e;
        }
    }

    @MessageMapping("/online.users")
    public void getOnlineUsers(@Payload List<Long> userIds, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        log.info("User {} requesting online status for users: {}", userId, userIds);
        
        try {
            Map<Long, UserPresence> presenceMap = userPresenceService.getUsersPresence(userIds);
            log.info("Retrieved presence map: {}", presenceMap);
            
            String destination = "/user/" + userId + "/queue/online.users";
            log.info("Sending presence map to destination: {}", destination);
            
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/online.users",
                presenceMap
            );
            log.info("Successfully sent presence map to user {}", userId);
        } catch (Exception e) {
            log.error("Error getting online users: {}", e.getMessage(), e);
        }
    }
} 