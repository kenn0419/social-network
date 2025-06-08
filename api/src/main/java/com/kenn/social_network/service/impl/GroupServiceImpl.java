package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Group;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.group.GroupCreationRequest;
import com.kenn.social_network.dto.request.group.GroupUpdateRequest;
import com.kenn.social_network.dto.response.group.GroupResponse;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.enums.GroupStatusEnum;
import com.kenn.social_network.exception.AuthorizationException;
import com.kenn.social_network.exception.GroupNotFoundException;
import com.kenn.social_network.mapper.GroupMapper;
import com.kenn.social_network.repository.GroupRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.CloudinaryService;
import com.kenn.social_network.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final CloudinaryService cloudinaryService;
    private final GroupMapper groupMapper;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    @Override
    public GroupResponse createGroup(GroupCreationRequest groupCreationRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<User> members = userRepository.findByIdIn(groupCreationRequest.getMemberIds());
        Group newGroup = groupMapper.toGroup(groupCreationRequest);
        newGroup.setOwner(currentUser);
        newGroup.setMembers(members);
        String coverImageUrl = cloudinaryService.getFileUrl(groupCreationRequest.getCoverImage());
        newGroup.setCoverUrl(coverImageUrl != null ?
                coverImageUrl : "https://res.cloudinary.com/dvfyiwfwo/image/upload/v1749256769/cover_default_ryqbrn.jpg");
        groupRepository.save(newGroup);
        return groupMapper.toGroupResponse(newGroup);
    }

    @Override
    public GroupResponse getGroupById(long id) {
        Group group = findById(id);
        return groupMapper.toGroupResponse(group);
    }

    @Override
    public PageResponse<List<GroupResponse>> getAllGroupsByCurrentUser(String search, int pageNo, int pageSize) {
        int page = pageNo;
        if (pageNo > 0) {
            page = pageNo - 1;
        }
        if (search != null && !search.isEmpty()) {
            search = "%" + search + "%";
        } else {
            search = "%";
        }
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Group> groupPage = groupRepository.findAll(search, pageable);

        return PageResponse.<List<GroupResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalPages(groupPage.getTotalPages())
                .data(groupPage.getContent().stream().map(groupMapper::toGroupResponse).toList())
                .build();
    }

    @Override
    public GroupResponse updateGroupInfo(GroupUpdateRequest groupUpdateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group existGroup = findById(groupUpdateRequest.getId());
        if (!currentUser.getId().equals(existGroup.getOwner().getId())) {
            throw new AuthorizationException("You don't have permission to perform this action!!!");
        }
        List<User> newMembers = userRepository.findByIdIn(groupUpdateRequest.getMemberIds());
        groupMapper.toGroup(groupUpdateRequest, existGroup);
        String coverUrl = cloudinaryService.getFileUrl(groupUpdateRequest.getCoverImage());
        if (coverUrl != null) {
            existGroup.setCoverUrl(coverUrl);
        }
        existGroup.setMembers(newMembers);
        groupRepository.save(existGroup);

        return groupMapper.toGroupResponse(existGroup);
    }

    @Override
    public GroupResponse changeGroupStatus(long groupId, GroupStatusEnum groupStatusEnum) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group existGroup = findById(groupId);
        if (!currentUser.getId().equals(existGroup.getOwner().getId())) {
            throw new AuthorizationException("You don't have permission to perform this action!!!");
        }

        existGroup.setGroupStatus(groupStatusEnum);
        groupRepository.save(existGroup);

        return groupMapper.toGroupResponse(existGroup);
    }

    @Override
    public void deleteGroup(long groupId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group existGroup = findById(groupId);
        if (!currentUser.getId().equals(existGroup.getOwner().getId())) {
            throw new AuthorizationException("You don't have permission to perform this action!!!");
        }
        groupRepository.deleteById(groupId);
    }

    private Group findById(long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));
    }
}
