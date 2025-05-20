package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Like;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);

    int countByPost(Post post);
}
