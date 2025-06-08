package com.kenn.social_network.repository;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
    List<UserPresence> findByUserIdIn(List<Long> userIds);
    
    Optional<UserPresence> findByUserId(Long userId);
    
    List<UserPresence> findByUserPresenceStatusAndLastActiveAtBefore(
        UserPresenceStatusEnum status,
        Timestamp timestamp
    );
}
