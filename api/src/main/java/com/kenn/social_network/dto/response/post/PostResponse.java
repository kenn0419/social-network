package com.kenn.social_network.dto.response.post;

import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import com.kenn.social_network.enums.MediaTypeEnum;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
public class PostResponse {

    private long id;

    private String content;

    private UserInfoResponse author;

    private List<PostMedia> postMedia = new ArrayList<>();

    private long likeCount = 0;

    private boolean isLiked;

    private GroupResponse groupResponse;

    private List<CommentResponse> comments = new ArrayList<>();

    private Timestamp createdAt;

    @Getter
    @Builder
    public static class PostMedia {
        private long id;

        private String url;

        private MediaTypeEnum type;
    }

    @Getter
    @Builder
    public static class GroupResponse {
        private long id;

        private String name;
    }
}
