package com.kenn.social_network.dto.response.group;

import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.GroupStatusEnum;
import lombok.Builder;
import lombok.Getter;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Builder
public class GroupResponse {

    private long id;

    private String name;

    private String description;

    private GroupStatusEnum groupStatus;

    private UserResponse owner;

    private List<UserResponse> members;

    private List<PostResponse> posts;

    private String coverImageUrl;

    private Timestamp createdAt;
}
