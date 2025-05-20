package com.kenn.social_network.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            log.info("Received WebSocket connection request with token: {}", token);

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    log.info("Successfully decoded JWT token for user: {}", jwt.getSubject());
                    
                    // Get user ID from JWT claims
                    Map<String, Object> data = (Map<String, Object>) jwt.getClaims().get("data");
                    if (data != null && data.containsKey("id")) {
                        String userId = data.get("id").toString();
                        log.info("Extracted user ID from JWT: {}", userId);
                        
                        // Create a Principal with the user ID
                        Principal principal = new Principal() {
                            @Override
                            public String getName() {
                                return userId;
                            }
                        };
                        
                        accessor.setUser(principal);
                        return message;
                    } else {
                        log.warn("No user ID found in JWT claims");
                        return null;
                    }
                } catch (Exception e) {
                    log.error("Failed to decode JWT token: {}", e.getMessage(), e);
                    return null;
                }
            } else {
                log.warn("Invalid or missing Authorization header in WebSocket connection request");
                return null;
            }
        }
        return message;
    }
} 