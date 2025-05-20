package com.kenn.social_network.repository;

import com.kenn.social_network.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
                SELECT c FROM Comment c
                WHERE c.post.id IN :postIds AND c.parentComment IS NULL
                ORDER BY c.createdAt DESC
            """)
    List<Comment> findRootCommentsByPostIds(@Param("postIds") List<Long> postIds);


    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(Long postId);

    List<Comment> findByParentCommentId(Long parentId);
}
