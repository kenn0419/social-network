package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.Group;
import com.kenn.social_network.dto.request.group.GroupCreationRequest;
import com.kenn.social_network.dto.request.group.GroupUpdateRequest;
import com.kenn.social_network.dto.response.group.GroupResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class GroupMapper {
    private final UserMapper userMapper;
    private final PostMapper postMapper;

    public Group toGroup(GroupCreationRequest groupCreationRequest) {
        return Group.builder()
                .name(groupCreationRequest.getName())
                .description(groupCreationRequest.getDescription())
                .groupStatus(groupCreationRequest.getGroupStatus())
                .build();
    }

    public void toGroup(GroupUpdateRequest groupUpdateRequest, Group group) {
        group.setName(groupUpdateRequest.getName());
        group.setDescription(groupUpdateRequest.getDescription());
        group.setGroupStatus(groupUpdateRequest.getGroupStatus());
    }

    public GroupResponse toGroupResponse(Group group) {
        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .owner(userMapper.toUserResponse(group.getOwner()))
                .groupStatus(group.getGroupStatus())
                .coverImageUrl(group.getCoverUrl())
                .members(group.getMembers().stream().map(userMapper::toUserResponse).toList())
                .posts(group.getPosts().isEmpty() ?
                        new ArrayList<>() : group.getPosts().stream().map(postMapper::toPostResponse).toList())
                .createdAt(group.getCreatedAt())
                .build();
    }
}
