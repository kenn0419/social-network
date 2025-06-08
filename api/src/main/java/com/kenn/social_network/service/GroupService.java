package com.kenn.social_network.service;

import com.kenn.social_network.dto.request.group.GroupCreationRequest;
import com.kenn.social_network.dto.request.group.GroupUpdateRequest;
import com.kenn.social_network.dto.response.group.GroupResponse;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.enums.GroupStatusEnum;

import java.util.List;

public interface GroupService {

    GroupResponse createGroup(GroupCreationRequest groupCreationRequest);

    GroupResponse getGroupById(long id);

    PageResponse<List<GroupResponse>> getAllGroupsByCurrentUser(String search, int pageNo, int pageSize);

    GroupResponse updateGroupInfo(GroupUpdateRequest groupUpdateRequest);

    GroupResponse changeGroupStatus(long groupId, GroupStatusEnum groupStatusEnum);

    void deleteGroup(long groupId);
}
