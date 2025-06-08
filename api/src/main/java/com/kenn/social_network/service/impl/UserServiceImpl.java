package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Friendship;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.Role;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.user.UserCreationRequest;
import com.kenn.social_network.dto.request.user.UserUpdateRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.FriendshipStatusEnum;
import com.kenn.social_network.enums.RoleEnum;
import com.kenn.social_network.enums.UserStatusEnum;
import com.kenn.social_network.exception.EmailAlreadyExistsException;
import com.kenn.social_network.exception.IdNotFoundException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.mapper.PostMapper;
import com.kenn.social_network.mapper.UserMapper;
import com.kenn.social_network.repository.FriendShipRepository;
import com.kenn.social_network.repository.RoleRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.CloudinaryService;
import com.kenn.social_network.service.UserService;
import com.kenn.social_network.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final CloudinaryService cloudinaryService;
    private final MessageUtil messageUtil;
    private final UserMapper userMapper;
    private final PostMapper postMapper;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final FriendShipRepository friendShipRepository;

    @Override
    public UserResponse createUser(UserCreationRequest userCreationRequest) throws IOException {
        boolean isExistEmail = userRepository.existsByEmail(userCreationRequest.getEmail());
        if (isExistEmail) {
            throw new EmailAlreadyExistsException(messageUtil.get("email.exists"));
        }
        String avatarUrl = cloudinaryService.getFileUrl(userCreationRequest.getAvatar());
        String coverUrl = cloudinaryService.getFileUrl(userCreationRequest.getCoverImage());

        User newUser = userMapper.toUser(userCreationRequest);
        newUser.setAvatarUrl(avatarUrl != null ?
                avatarUrl : "https://res.cloudinary.com/dvfyiwfwo/image/upload/v1749256769/avatar_default_kmtpw1.png");

        newUser.setCoverUrl(coverUrl != null ?
                coverUrl : "https://res.cloudinary.com/dvfyiwfwo/image/upload/v1749256769/cover_default_ryqbrn.jpg");

        Role newUserRole = roleRepository.findByName(RoleEnum.USER.name());
        newUser.setRole(newUserRole);

        this.userRepository.save(newUser);

        return userMapper.toUserResponse(newUser);
    }

    @Override
    public PageResponse<List<UserResponse>> getAllUsers(String search, int pageNo, int pageSize, String sort) {
        int page = pageNo;
        if (pageNo > 0) {
            page = pageNo - 1;
        }
        if (search != null && !search.isEmpty()) {
            search = "%" + search + "%";
        } else {
            search = "%";
        }
        String[] sortArr = sort.split(",");
        Sort sortBy = Sort.by(Sort.Direction.fromString(sortArr[1].toUpperCase()), sortArr[0]);
        Pageable pageable = PageRequest.of(page, pageSize, sortBy);
        Page<User> userPage = userRepository.findAll(search, pageable);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<User> users = userPage.getContent();
        List<Long> userIds = users.stream().map(User::getId).toList();

        List<Friendship> friendships = friendShipRepository.findFriendshipsBetweenUserAndOthers(currentUser.getId(), userIds);
        Map<Long, FriendshipStatusEnum> friendshipStatusMap = new HashMap<>();
        for (Friendship f : friendships) {
            Long otherUserId = f.getRequester().getId().equals(currentUser.getId())
                    ? f.getAddressee().getId()
                    : f.getRequester().getId();
            friendshipStatusMap.put(otherUserId, f.getStatus());
        }
        List<UserResponse> userResponses = users.stream().map(userMapper::toUserResponse).toList();
        userResponses.forEach(item -> {
            FriendshipStatusEnum status = friendshipStatusMap.getOrDefault(item.getId(), null);
            item.setFriendshipStatusEnum(status);
        });
        return PageResponse.<List<UserResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalPages(userPage.getTotalPages())
                .data(userResponses)
                .build();
    }

    @Override
    public UserResponse getUserResponseById(long userId) {
        User existUser = getUserById(userId);
        return userMapper.toUserResponse(existUser);
    }

    @Override
    public UserResponse updateUser(UserUpdateRequest userUpdateRequest) throws IOException {
        User updateUser = getUserById(userUpdateRequest.getId());
        User existsUserByEmail = userRepository.findByEmail(userUpdateRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException(messageUtil.get("user.email.not-found")));
        if (existsUserByEmail != null && updateUser.getId().equals(existsUserByEmail.getId())) {
            throw new EmailAlreadyExistsException(messageUtil.get("email.exists"));
        }
        String avatarUrl = cloudinaryService.getFileUrl(userUpdateRequest.getAvatar());
        String coverUrl = cloudinaryService.getFileUrl(userUpdateRequest.getCoverImage());
        userMapper.toUser(userUpdateRequest, updateUser);
        if (avatarUrl != null) {
            updateUser.setAvatarUrl(avatarUrl);
        }
        if (coverUrl != null) {
            updateUser.setCoverUrl(coverUrl);
        }
        userRepository.save(updateUser);
        return userMapper.toUserResponse(updateUser);
    }

    @Override
    public UserResponse changeStatusUser(long userId, UserStatusEnum userStatusEnum) {
        User updateUser = getUserById(userId);
        updateUser.setStatus(userStatusEnum);
        userRepository.save(updateUser);

        return userMapper.toUserResponse(updateUser);
    }

    @Override
    public void deleteUser(long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public Map<String, Object> fetchUserProfile(long userId, String search) {
        User existUser = getUserById(userId);
        List<Post> posts = existUser.getPosts();
        List<PostResponse> postResponses = new ArrayList<>();
        if (!posts.isEmpty()) {
            postResponses = posts.stream().map(postMapper::toPostResponse).toList();
        }
        List<User> friends = friendShipRepository.searchFriends(userId, search);
        List<UserResponse> friendResponses = new ArrayList<>();
        if (!friends.isEmpty()) {
            friendResponses = friends.stream().map(userMapper::toUserResponse).toList();
        }
        Map<String, Object> result = new HashMap<>();
        result.put("user", userMapper.toUserResponse(existUser));
        result.put("friends", friendResponses);
        result.put("posts", postResponses);

        return result;
    }

    private User getUserById(long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IdNotFoundException(messageUtil.get("user.id.not-found")));
    }
}
