package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.group.GroupCreationRequest;
import com.kenn.social_network.dto.request.group.GroupUpdateRequest;
import com.kenn.social_network.dto.response.group.GroupResponse;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.enums.GroupStatusEnum;
import com.kenn.social_network.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    SuccessResponse<GroupResponse> createGroup(@Valid @ModelAttribute GroupCreationRequest groupCreationRequest) {
        return SuccessResponse.<GroupResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Create group successfully!!!")
                .data(groupService.createGroup(groupCreationRequest))
                .build();
    }

    @GetMapping
    SuccessResponse<PageResponse<List<GroupResponse>>> getAllGroupsByCurrentUser(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        return SuccessResponse.<PageResponse<List<GroupResponse>>>builder()
                .message("Get all groups successfully!!!")
                .data(groupService.getAllGroupsByCurrentUser(search, pageNo, pageSize))
                .build();
    }

    @GetMapping("/{id}")
    SuccessResponse<GroupResponse> getGroupById(@PathVariable("id") long groupId) {
        return SuccessResponse.<GroupResponse>builder()
                .message("Get group by id successfully!!!")
                .data(groupService.getGroupById(groupId))
                .build();
    }

    @PutMapping
    SuccessResponse<GroupResponse> updateGroupInfo(@Valid @ModelAttribute GroupUpdateRequest groupUpdateRequest) {
        return SuccessResponse.<GroupResponse>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Update group info successfully!!!")
                .data(groupService.updateGroupInfo(groupUpdateRequest))
                .build();
    }

    @PatchMapping("/{id}")
    SuccessResponse<GroupResponse> changeGroupStatus(@PathVariable("id") long groupId,
                                                     @RequestParam("status") GroupStatusEnum groupStatus) {
        return SuccessResponse.<GroupResponse>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Change group status successfully!!!")
                .data(groupService.changeGroupStatus(groupId, groupStatus))
                .build();
    }

    @DeleteMapping("/{id}")
    SuccessResponse<Void> deleteGroup(@PathVariable("id") long groupId) {
        groupService.deleteGroup(groupId);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.NO_CONTENT.value())
                .message("Delete group successfully!!!")
                .build();
    }
}
