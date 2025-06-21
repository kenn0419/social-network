package com.kenn.social_network.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.dto.response.notification.NotificationResponse;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import com.kenn.social_network.service.UserPresenceService;
import com.kenn.social_network.webrtc.IceCandidateMessage;
import com.kenn.social_network.webrtc.SdpMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserPresenceService userPresenceService;
    private final ObjectMapper objectMapper;

    private final Map<String, Map<String, String>> activeCalls = new ConcurrentHashMap<>();

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

    @MessageMapping("/call.initiate")
    public void initiateCall(@Payload Map<String, String> callDetails, SimpMessageHeaderAccessor headerAccessor) {
        String callerId = headerAccessor.getUser().getName();
        String receiverId = callDetails.get("receiverId");
        String callId = callDetails.get("callId");
        if (callId == null || callId.isEmpty()) {
            log.error("Call ID is missing in initiateCall message from {}", callerId);
            return;
        }
        log.info("User {} is initiating a call to user {}", callerId, receiverId);

        activeCalls.put(callId, Map.of("callerId", callerId, "receiverId", receiverId, "status", "INITIATED"));

        // Gửi thông báo cuộc gọi đến người nhận
        messagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/call.incoming",
                Map.of("callerId", callerId, "callerName", callDetails.get("callerName"), "callId", callId)
        );

        // Gửi thông báo cho người gọi để biết đã gửi yêu cầu
        messagingTemplate.convertAndSendToUser(
                callerId,
                "/queue/call.outgoing",
                Map.of("receiverId", receiverId, "callId", callId, "status", "INITIATED")
        );
    }

    @MessageMapping("/call.accept")
    public void acceptCall(@Payload Map<String, String> callDetails, SimpMessageHeaderAccessor headerAccessor) {
        String receiverId = headerAccessor.getUser().getName();
        String callerId = callDetails.get("callerId");
        String callId = callDetails.get("callId");

        log.info("User {} accepted call from user {} with ID {}", receiverId, callerId, callId);

        // Cập nhật trạng thái cuộc gọi
        activeCalls.put(callId, Map.of("callerId", callerId, "receiverId", receiverId, "status", "ACCEPTED"));


        // Thông báo cho người gọi biết cuộc gọi đã được chấp nhận
        messagingTemplate.convertAndSendToUser(
                callerId,
                "/queue/call.outgoing",
                Map.of("receiverId", receiverId, "callId", callId, "status", "ACCEPTED")
        );

        // Thông báo cho người nhận biết cuộc gọi đã được chấp nhận (để họ có thể điều hướng)
        messagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/call.accepted", // Kênh riêng để người nhận nhận được xác nhận
                Map.of("callerId", callerId, "callId", callId, "status", "ACCEPTED")
        );
    }

    @MessageMapping("/call.reject")
    public void rejectCall(@Payload Map<String, String> callDetails, SimpMessageHeaderAccessor headerAccessor) {
        String receiverId = headerAccessor.getUser().getName();
        String callerId = callDetails.get("callerId");
        String callId = callDetails.get("callId");

        log.info("User {} rejected call from user {} with ID {}", receiverId, callerId, callId);

        // Xóa cuộc gọi khỏi danh sách activeCalls
        activeCalls.remove(callId);

        // Thông báo cho người gọi biết cuộc gọi đã bị từ chối
        messagingTemplate.convertAndSendToUser(
                callerId,
                "/queue/call.outgoing",
                Map.of("receiverId", receiverId, "callId", callId, "status", "REJECTED")
        );
    }

    @MessageMapping("/call.end")
    public void endCall(@Payload Map<String, String> callDetails, SimpMessageHeaderAccessor headerAccessor) {
        String userId = headerAccessor.getUser().getName();
        String callId = callDetails.get("callId");

        Map<String, String> participants = activeCalls.get(callId);
        if (participants != null) {
            String callerId = participants.get("callerId");
            String receiverId = participants.get("receiverId");
            String otherParticipantId = Objects.equals(callerId, userId) ? receiverId : callerId;

            log.info("User {} ended call with user {} (callId: {})", userId, otherParticipantId, callId);

            // Thông báo cho bên còn lại rằng cuộc gọi đã kết thúc
            messagingTemplate.convertAndSendToUser(
                    otherParticipantId,
                    "/queue/call.ended",
                    Map.of("callId", callId, "reason", "user_ended", "endedByUser", userId)
            );

            // Xóa cuộc gọi khỏi danh sách activeCalls
            activeCalls.remove(callId);
        } else {
            log.warn("Call with ID {} not found when user {} tried to end it.", callId, userId);
        }
    }

    @MessageMapping("/webrtc.sdp")
    public void handleSdp(@Payload SdpMessage sdpMessage, SimpMessageHeaderAccessor headerAccessor) {
        String senderId = headerAccessor.getUser().getName();
        String callId = sdpMessage.getCallId(); // Giả định SdpMessage có thêm callId
        String targetUserId = sdpMessage.getTargetUserId(); // Giả định SdpMessage có thêm targetUserId

        log.info("Received SDP {} from {} for call {} to {}", sdpMessage.getType(), senderId, callId, targetUserId);

        // Chuyển tiếp SDP đến người nhận
        messagingTemplate.convertAndSendToUser(
                targetUserId,
                "/queue/webrtc.sdp",
                sdpMessage
        );
    }

    @MessageMapping("/webrtc.ice")
    public void handleIceCandidate(@Payload IceCandidateMessage iceCandidateMessage, SimpMessageHeaderAccessor headerAccessor) {
        String senderId = headerAccessor.getUser().getName();
        String callId = iceCandidateMessage.getCallId(); // Giả định IceCandidateMessage có thêm callId
        String targetUserId = iceCandidateMessage.getTargetUserId(); // Giả định IceCandidateMessage có thêm targetUserId

        log.info("Received ICE candidate from {} for call {} to {}", senderId, callId, targetUserId);

        // Chuyển tiếp ICE candidate đến người nhận
        messagingTemplate.convertAndSendToUser(
                targetUserId,
                "/queue/webrtc.ice",
                iceCandidateMessage
        );
    }
} 