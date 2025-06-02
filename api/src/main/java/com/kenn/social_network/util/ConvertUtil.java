package com.kenn.social_network.util;

import com.kenn.social_network.domain.*;
import com.kenn.social_network.dto.request.auth.AuthRegisterRequest;
import com.kenn.social_network.dto.request.user.UserCreationRequest;
import com.kenn.social_network.dto.request.user.UserUpdateRequest;
import com.kenn.social_network.dto.response.auth.AuthResponse;
import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.dto.response.message.MessageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ConvertUtil {

    private final PasswordEncoder passwordEncoder;

    public User toUser(UserCreationRequest userCreationRequest, String avatarUrl, String coverUrl) {
        return User.builder()
                .firstName(userCreationRequest.getFirstName())
                .lastName(userCreationRequest.getLastName())
                .email(userCreationRequest.getEmail())
                .address(userCreationRequest.getAddress())
                .password(passwordEncoder.encode(userCreationRequest.getPassword()))
                .bio(userCreationRequest.getBio())
                .avatarUrl(avatarUrl)
                .coverUrl(coverUrl)
                .status(userCreationRequest.getStatus())
                .build();
    }

    public void toUser(UserUpdateRequest userUpdateRequest, String avatarUrl, String coverUrl, User user) {
        user.setId(userUpdateRequest.getId());
        user.setFirstName(userUpdateRequest.getFirstName());
        user.setLastName(userUpdateRequest.getLastName());
        user.setEmail(userUpdateRequest.getEmail());
        user.setAddress(userUpdateRequest.getAddress());
        user.setAvatarUrl(avatarUrl);
        user.setCoverUrl(coverUrl);
        user.setBio(userUpdateRequest.getBio());
        user.setStatus(userUpdateRequest.getStatus());
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
                .build();
    }

    public PostResponse toPostResponse(Post post, User currentUser) {
        User author = post.getUser();
        UserInfoResponse userInfoResponse = toUserInfoResponse(author);

        List<PostResponse.PostMedia> postMedias = post.getPostMedias().stream().map(item ->
                PostResponse.PostMedia.builder()
                        .id(item.getId())
                        .url(item.getUrl())
                        .type(item.getType())
                        .build()).toList();

        List<CommentResponse> commentResponses = post.getComments().stream().map(this::toCommentResponse).toList();
        List<Like> likes = post.getLikes();
        boolean isLiked = likes.stream().anyMatch(like -> like.getUser().equals(currentUser));

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .author(userInfoResponse)
                .postMedia(postMedias)
                .comments(commentResponses)
                .likeCount(likes.size())
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .build();
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

    public AuthResponse.User toAuthResponseUser(User user) {
        return AuthResponse.User.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
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

    public CommentResponse toCommentResponse(Comment comment) {
        User author = comment.getUser();
        UserInfoResponse userInfoResponse = toUserInfoResponse(author);

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .commenter(userInfoResponse)
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : 0)
                .replyCount(comment.getReplies().size())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .sender(toUserResponse(message.getSender()))
                .receiver(toUserResponse(message.getReceiver()))
                .content(message.getContent())
                .createdAt(Timestamp.from(Instant.now()))
                .build();
    }
}
