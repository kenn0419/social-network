package com.kenn.social_network.repository;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.enums.UserPresenceStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
    List<UserPresence> findByUserIdIn(List<Long> userIds);
    
    Optional<UserPresence> findByUserId(Long userId);
    
    // Tìm users đang online nhưng không hoạt động trong một khoảng thời gian
    List<UserPresence> findByUserPresenceStatusAndLastActiveAtBefore(
        UserPresenceStatusEnum status,
        Timestamp timestamp
    );
}
