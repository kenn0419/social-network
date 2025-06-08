package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.Comment;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentMapper {

    private final UserMapper userMapper;

    public CommentResponse toCommentResponse(Comment comment) {
        User author = comment.getUser();
        UserInfoResponse userInfoResponse = userMapper.toUserInfoResponse(author);

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .commenter(userInfoResponse)
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : 0)
                .replyCount(comment.getReplies().size())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
