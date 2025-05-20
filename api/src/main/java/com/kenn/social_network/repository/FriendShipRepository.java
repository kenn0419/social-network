package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Friendship;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.enums.FriendshipStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FriendShipRepository extends JpaRepository<Friendship, Long> {

    @Query("""
                SELECT u FROM User u
                WHERE u.id IN (
                    SELECT CASE
                             WHEN f.requester.id = :userId THEN f.addressee.id
                             ELSE f.requester.id
                           END
                    FROM Friendship f
                    WHERE (f.requester.id = :userId OR f.addressee.id = :userId)
                      AND f.status = 'ACCEPTED'
                )
                AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                     OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    List<User> searchFriends(@Param("userId") Long userId, @Param("keyword") String keyword);

    @Query("""
                SELECT f FROM Friendship f
                WHERE (f.requester.id = :currentUserId AND f.addressee.id IN :userIds)
                   OR (f.addressee.id = :currentUserId AND f.requester.id IN :userIds)
            """)
    List<Friendship> findFriendshipsBetweenUserAndOthers(Long currentUserId, List<Long> userIds);

    @Query("""
                SELECT f FROM Friendship f
                WHERE (f.requester.id = :userId OR f.addressee.id = :userId)
                  AND (f.status = 'ACCEPTED' OR f.status = 'BLOCKED')
                ORDER BY f.createdAt DESC
            """)
    List<Friendship> findAllFriendships(@Param("userId") Long userId);

    @Query("""
                SELECT CASE
                    WHEN f.requester.id = :userId THEN f.addressee.id
                    ELSE f.requester.id
                END
                FROM Friendship f
                WHERE (f.requester.id = :userId OR f.addressee.id = :userId)
                  AND f.status = 'ACCEPTED'
            """)
    List<Long> findFriendIds(@Param("userId") Long userId);


    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);

    List<Friendship> findAllByAddresseeAndStatus(User addressee, FriendshipStatus friendshipStatus, Sort sort);
}
