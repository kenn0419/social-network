package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
                SELECT p FROM Post p
                WHERE p.user.id IN :ids AND p.createdAt >= :fromDate AND p.postType = PERSONAL
                ORDER BY p.createdAt DESC
            """)
    List<Post> findRecentPostsOfUserAndFriends(@Param("ids") List<Long> ids, @Param("fromDate") LocalDateTime fromDate);


    Page<Post> findByUser(User user, Pageable pageable);

}
