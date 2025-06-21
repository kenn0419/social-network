package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.auth.AuthRegisterRequest;
import com.kenn.social_network.dto.request.user.UserCreationRequest;
import com.kenn.social_network.dto.request.user.UserUpdateRequest;
import com.kenn.social_network.dto.response.auth.AuthResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public User toUser(UserCreationRequest userCreationRequest) {
        return User.builder()
                .firstName(userCreationRequest.getFirstName())
                .lastName(userCreationRequest.getLastName())
                .email(userCreationRequest.getEmail())
                .address(userCreationRequest.getAddress())
                .password(passwordEncoder.encode(userCreationRequest.getPassword()))
                .bio(userCreationRequest.getBio())
                .status(userCreationRequest.getStatus())
                .build();
    }

    public void toUser(UserUpdateRequest userUpdateRequest, User user) {
        user.setId(userUpdateRequest.getId());
        user.setFirstName(userUpdateRequest.getFirstName());
        user.setLastName(userUpdateRequest.getLastName());
        user.setEmail(userUpdateRequest.getEmail());
        user.setAddress(userUpdateRequest.getAddress());
        user.setBio(userUpdateRequest.getBio());
        user.setStatus(userUpdateRequest.getStatus());
    }

    public User toUser(AuthRegisterRequest authRegisterRequest) {
        return User.builder()
                .firstName(authRegisterRequest.getFirstName())
                .lastName(authRegisterRequest.getLastName())
                .email(authRegisterRequest.getEmail())
                .password(passwordEncoder.encode(authRegisterRequest.getPassword()))
                .address(authRegisterRequest.getAddress())
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .address(user.getAddress())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
                .role(user.getRole().getName())
                .status(user.getStatus())
                .build();
    }

    public AuthResponse.User toAuthResponseUser(User user) {
        return AuthResponse.User.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getName())
                .build();
    }

    public UserInfoResponse toUserInfoResponse(User user) {
        return UserInfoResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
