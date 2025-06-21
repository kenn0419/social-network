package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Group;
import com.kenn.social_network.domain.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("""
            SELECT g FROM Group g
            WHERE g.name LIKE :search OR g.description LIKE :search
            ORDER BY g.createdAt DESC
            """)
    Page<Group> findAll(@Param("search") String search, Pageable pageable);

    @Query("""
                SELECT g FROM Group g
                WHERE (g.owner = :user OR :user MEMBER OF g.members)
                    AND (
                        LOWER(g.name) LIKE :search
                        OR LOWER(g.description) LIKE :search
                    )
                ORDER BY g.createdAt DESC
            """)
    Page<Group> findAllOfCurrentUser(@Param("search") String search, @Param("user") User user, Pageable pageable);

}
