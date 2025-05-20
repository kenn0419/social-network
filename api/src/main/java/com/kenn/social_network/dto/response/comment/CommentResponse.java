package com.kenn.social_network.dto.response.comment;


import com.kenn.social_network.dto.response.user.UserInfoResponse;
import lombok.Builder;
import lombok.Getter;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Builder
public class CommentResponse {

    private long id;

    private String content;

    private UserInfoResponse commenter;

    private Long parentId;

    private long replyCount;

    private Timestamp createdAt;
}
