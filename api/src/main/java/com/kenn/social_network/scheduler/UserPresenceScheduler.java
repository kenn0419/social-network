package com.kenn.social_network.scheduler;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import com.kenn.social_network.repository.UserPresenceRepository;
import com.kenn.social_network.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserPresenceScheduler {

    private final UserPresenceRepository userPresenceRepository;
    private final UserPresenceService userPresenceService;
//    private final RedisTemplate<String, Object> redisTemplate;

    // Chạy mỗi 5 phút
    @Scheduled(fixedRate = 180000)
    public void updateInactiveUsers() {
        try {
            log.info("Starting scheduled task to update inactive users");
            
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(3);
            Timestamp timestamp = Timestamp.valueOf(fiveMinutesAgo);

            List<UserPresence> inactiveUsers = userPresenceRepository.findByUserPresenceStatusAndLastActiveAtBefore(
                UserPresenceStatusEnum.ONLINE,
                timestamp
            );

            for (UserPresence user : inactiveUsers) {
                userPresenceService.updateUserPresence(user.getUserId(), UserPresenceStatusEnum.AWAY);
                log.info("Updated user {} status to AWAY", user.getUserId());
            }

            log.info("Completed scheduled task. Updated {} users to AWAY status", inactiveUsers.size());
        } catch (Exception e) {
            log.error("Error in updateInactiveUsers scheduled task: {}", e.getMessage(), e);
        }
    }
}
