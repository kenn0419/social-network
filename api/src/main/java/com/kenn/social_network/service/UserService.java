package com.kenn.social_network.service;

import com.kenn.social_network.domain.Like;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.user.UserCreationRequest;
import com.kenn.social_network.dto.request.user.UserUpdateRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.UserStatus;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface UserService {
    UserResponse createUser(UserCreationRequest userCreationRequest) throws IOException;

    PageResponse<List<UserResponse>> getAllUsers(String search, int pageNo, int pageSize, String sort);

    UserResponse getUserResponseById(long userId);

    UserResponse updateUser(UserUpdateRequest userUpdateRequest) throws IOException;

    UserResponse changeStatusUser(long userId, UserStatus userStatus);

    void deleteUser(long userId);

    Map<String, Object> fetchUserProfile(long userId, String search);

}
