package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.user.UserCreationRequest;
import com.kenn.social_network.dto.request.user.UserUpdateRequest;
import com.kenn.social_network.dto.response.friend_ship.FriendShipResponse;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.dto.response.user.FriendWithStatusResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.UserStatusEnum;
import com.kenn.social_network.service.FriendShipService;
import com.kenn.social_network.service.UserService;
import com.kenn.social_network.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MessageUtil messageUtil;
    private final FriendShipService friendShipService;

    @PostMapping
    SuccessResponse<UserResponse> createUser(@Valid @ModelAttribute UserCreationRequest userCreationRequest) throws IOException {
        return SuccessResponse.<UserResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message(messageUtil.get("user.create.message"))
                .data(userService.createUser(userCreationRequest))
                .build();
    }

    @GetMapping
    SuccessResponse<PageResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sort", defaultValue = "id,asc") String sort) {
        return SuccessResponse.<PageResponse<List<UserResponse>>>builder()
                .message(messageUtil.get("user.getAll.message"))
                .data(userService.getAllUsers(search, pageNo, pageSize, sort))
                .build();
    }

    @GetMapping("/{id}")
    SuccessResponse<UserResponse> getUserById(@PathVariable("id") long id) {
        return SuccessResponse.<UserResponse>builder()
                .message(messageUtil.get("user.get-by-id.message"))
                .data(userService.getUserResponseById(id))
                .build();
    }

    @PutMapping
    SuccessResponse<UserResponse> updateUser(@Valid @ModelAttribute UserUpdateRequest userUpdateRequest) throws IOException {
        return SuccessResponse.<UserResponse>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message(messageUtil.get("user.update.message"))
                .data(userService.updateUser(userUpdateRequest))
                .build();
    }

    @PatchMapping("/{id}")
    SuccessResponse<UserResponse> changeStatusUser(
            @PathVariable("id") long id,
            @RequestParam("status") UserStatusEnum userStatusEnum
    ) {
        return SuccessResponse.<UserResponse>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message(messageUtil.get("user.update.message"))
                .data(userService.changeStatusUser(id, userStatusEnum))
                .build();
    }

    @DeleteMapping("/{id}")
    SuccessResponse<Void> deleteUser(@PathVariable("id") long id) {
        userService.deleteUser(id);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.NO_CONTENT.value())
                .message(messageUtil.get("user.delete.message"))
                .data(null)
                .build();
    }

    @GetMapping("/profile/{id}")
    SuccessResponse<Map<String, Object>> getUserProfile(@PathVariable("id") long id,
                                                        @RequestParam(value = "search", required = false) String search) {
        return SuccessResponse.<Map<String, Object>>builder()
                .message("Get profile successfully!!!")
                .data(userService.fetchUserProfile(id, search))
                .build();
    }

    @PostMapping("/{id}/toggle-friend")
    SuccessResponse<Void> toggleFriendShip(@PathVariable("id") long id) {
        friendShipService.changeFriendShipStatus(id);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Change friendship status successfully!!!")
                .build();
    }

    @GetMapping("/friend-requests")
    SuccessResponse<List<FriendShipResponse>> getAllFriendShipRequest() {
        return SuccessResponse.<List<FriendShipResponse>>builder()
                .message("Get all friend ship request successfully!!!")
                .data(friendShipService.fetchAllFriendShipRequest())
                .build();
    }

    @GetMapping("/friend-list")
    SuccessResponse<List<UserResponse>> getAllFriend() {
        return SuccessResponse.<List<UserResponse>>builder()
                .message("Get all friend successfully!!!")
                .data(friendShipService.fetchAllFriends())
                .build();
    }


    @GetMapping("/friends/presence")
    SuccessResponse<List<FriendWithStatusResponse>> getFriendWithStatus() {
        return SuccessResponse.<List<FriendWithStatusResponse>>builder()
                .message("Get all friend with status successfully!!!")
                .data(friendShipService.fetchAllFriendsWithStatus())
                .build();
    }
}
