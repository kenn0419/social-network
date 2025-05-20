package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            SELECT m FROM Message m WHERE
            (m.sender.id = :user1 AND m.receiver.id = :user2)
            OR (m.sender.id = :user2 AND m.receiver.id = :user1)
            ORDER BY m.createdAt ASC
            """)
    List<Message> findChatBetween(Long user1, Long user2);

    @Query("SELECT m FROM Message m WHERE m.id IN (" +
            "SELECT MAX(m2.id) FROM Message m2 " +
            "WHERE (m2.sender.id = :userId OR m2.receiver.id = :userId) " +
            "GROUP BY CASE " +
            "WHEN m2.sender.id = :userId THEN m2.receiver.id " +
            "ELSE m2.sender.id END)")
    List<Message> findLatestMessagesByUser(@Param("userId") Long userId, Pageable pageable);
}
