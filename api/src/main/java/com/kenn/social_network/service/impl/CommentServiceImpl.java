package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Comment;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.comment.CommentRequest;
import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.exception.CommentNotFoundException;
import com.kenn.social_network.exception.PostNotFoundException;
import com.kenn.social_network.mapper.CommentMapper;
import com.kenn.social_network.repository.CommentRepository;
import com.kenn.social_network.repository.PostRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public CommentResponse commentPost(long postId, CommentRequest commentRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        Comment parent = null;
        if (commentRequest.getParentId() != null) {
            parent = commentRepository.findById(commentRequest.getParentId())
                    .orElseThrow(() -> new CommentNotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(commentRequest.getComment())
                .user(currentUser)
                .post(post)
                .parentComment(parent)
                .build();

        commentRepository.save(comment);

        return commentMapper.toCommentResponse(comment);
    }

    @Override
    public List<CommentResponse> getCommentsByPost(long postId) {
        List<Comment> comments = commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(postId);
        return comments.stream().map(commentMapper::toCommentResponse).toList();
    }

    @Override
    public List<CommentResponse> getRepliesByCommentId(long parentCommentId) {
        List<Comment> replies = commentRepository.findByParentCommentId(parentCommentId);

        return replies.stream().map(commentMapper::toCommentResponse).toList();
    }
}
