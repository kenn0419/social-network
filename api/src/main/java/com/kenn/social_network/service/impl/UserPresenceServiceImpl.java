package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import com.kenn.social_network.repository.UserPresenceRepository;
import com.kenn.social_network.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPresenceServiceImpl implements UserPresenceService {

    private final UserPresenceRepository userPresenceRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private static final Duration PRESENCE_EXPIRATION = Duration.ofMinutes(3);

    @Override
    @Transactional
    public void updateUserPresence(long userId, UserPresenceStatusEnum userPresenceStatus) {
        log.info("Updating presence for user {} to status {}", userId, userPresenceStatus);
        LocalDateTime now = LocalDateTime.now();
        Timestamp timestamp = Timestamp.valueOf(now);

        UserPresence userPresence = userPresenceRepository.findByUserId(userId)
                .orElseGet(() -> UserPresence.builder().userId(userId).build());

        userPresence.setUserPresenceStatus(userPresenceStatus);
        userPresence.setLastActiveAt(timestamp);
        
        userPresence = userPresenceRepository.save(userPresence);
        log.info("Saved user presence to database: {}", userPresence);
        
        String key = "user:presence:" + userId;
        try {
            redisTemplate.opsForValue().set(key, userPresence, PRESENCE_EXPIRATION);
            log.info("Saved user presence to Redis with key {} and expiration {}", key, PRESENCE_EXPIRATION);
        } catch (Exception e) {
            log.error("Failed to save user presence to Redis", e);
        }


        // Broadcast status update
        messagingTemplate.convertAndSend("/topic/status", userPresence);
        log.info("Broadcasted status update for user {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, UserPresence> getUsersPresence(List<Long> userIds) {
        log.info("Getting presence for users: {}", userIds);
        Map<Long, UserPresence> result = new HashMap<>();
        
        // First try to get from Redis
        for (Long userId : userIds) {
            String key = "user:presence:" + userId;
            UserPresence userPresence = (UserPresence) redisTemplate.opsForValue().get(key);
            if (userPresence != null) {
                log.info("Found presence in Redis for user {}: {}", userId, userPresence);
                result.put(userId, userPresence);
            } else {
                log.info("No presence found in Redis for user {}", userId);
            }
        }

        // Then get missing users from database
        List<Long> missingUserIds = userIds.stream()
                .filter(id -> !result.containsKey(id))
                .toList();

        if (!missingUserIds.isEmpty()) {
            log.info("Fetching missing presences from database for users: {}", missingUserIds);
            List<UserPresence> userPresences = userPresenceRepository.findByUserIdIn(missingUserIds);
            
            // Create default presence for users not found in database
            for (Long userId : missingUserIds) {
                if (userPresences.stream().noneMatch(p -> p.getUserId() == userId)) {
                    log.info("Creating default OFFLINE presence for user {}", userId);
                    UserPresence defaultPresence = UserPresence.builder()
                            .userId(userId)
                            .userPresenceStatus(UserPresenceStatusEnum.OFFLINE)
                            .lastActiveAt(Timestamp.valueOf(LocalDateTime.now()))
                            .build();
                    result.put(userId, defaultPresence);
                    
                    // Save default presence to Redis
                    String key = "user:presence:" + userId;
                    redisTemplate.opsForValue().set(key, defaultPresence, PRESENCE_EXPIRATION);
                    log.info("Saved default presence to Redis for user {}", userId);
                }
            }

            // Add found presences to result and Redis
            for (UserPresence userPresence : userPresences) {
                log.info("Found presence in database for user {}: {}", userPresence.getUserId(), userPresence);
                result.put(userPresence.getUserId(), userPresence);
                
                // Save to Redis
                String key = "user:presence:" + userPresence.getUserId();
                redisTemplate.opsForValue().set(key, userPresence, PRESENCE_EXPIRATION);
                log.info("Saved presence to Redis for user {}", userPresence.getUserId());
            }
        }

        log.info("Final presence map: {}", result);
        return result;
    }
}
