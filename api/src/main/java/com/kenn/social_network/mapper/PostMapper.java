package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.Like;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PostMapper {
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;

    public PostResponse toPostResponse(Post post) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = post.getUser();
        UserInfoResponse userInfoResponse = userMapper.toUserInfoResponse(author);

        List<PostResponse.PostMedia> postMedias = post.getPostMedias().stream().map(item ->
                PostResponse.PostMedia.builder()
                        .id(item.getId())
                        .url(item.getUrl())
                        .type(item.getType())
                        .build()).toList();

        List<CommentResponse> commentResponses = post.getComments().stream().map(commentMapper::toCommentResponse).toList();
        List<Like> likes = post.getLikes();
        boolean isLiked = likes.stream().anyMatch(like -> like.getUser().getEmail().equals(email));

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .author(userInfoResponse)
                .postMedia(postMedias)
                .comments(commentResponses)
                .likeCount(likes.size())
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
