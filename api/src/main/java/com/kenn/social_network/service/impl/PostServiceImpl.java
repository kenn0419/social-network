package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.*;
import com.kenn.social_network.dto.request.post.PostCreationRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import com.kenn.social_network.enums.MediaTypeEnum;
import com.kenn.social_network.enums.PostTypeEnum;
import com.kenn.social_network.exception.AuthorizationException;
import com.kenn.social_network.exception.GroupNotFoundException;
import com.kenn.social_network.exception.PostNotFoundException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.mapper.PostMapper;
import com.kenn.social_network.repository.*;
import com.kenn.social_network.service.CloudinaryService;
import com.kenn.social_network.service.NotificationService;
import com.kenn.social_network.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostMapper postMapper;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final GroupRepository groupRepository;
    private final FriendShipRepository friendShipRepository;
    private final NotificationService notificationService;

    @Override
    public PostResponse createPost(PostCreationRequest postCreationRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Group existGroup = postCreationRequest.getGroupId() != null ?
                groupRepository.findById(postCreationRequest.getGroupId())
                        .orElseThrow(() -> new GroupNotFoundException("Group not found")) : null;
        Post newPost = Post.builder()
                .content(postCreationRequest.getContent())
                .user(currentUser)
                .group(existGroup)
                .postType(postCreationRequest.getPostType())
                .build();

        if (postCreationRequest.getMediaFiles() != null && !postCreationRequest.getMediaFiles().isEmpty()) {
            List<PostMedia> mediaList = postCreationRequest.getMediaFiles().stream().map(item -> {
                String mediaUrl = cloudinaryService.getFileUrl(item);
                MediaTypeEnum mediaTypeEnum = null;
                if (item != null && item.getContentType() != null) {
                    if (item.getContentType().startsWith("image/")) {
                        mediaTypeEnum = MediaTypeEnum.IMAGE;
                    } else if (item.getContentType().startsWith("video/")) {
                        mediaTypeEnum = MediaTypeEnum.VIDEO;
                    }
                }


                return PostMedia.builder()
                        .url(mediaUrl)
                        .type(mediaTypeEnum)
                        .post(newPost)
                        .build();
            }).toList();

            newPost.getPostMedias().addAll(mediaList);
        }
        postRepository.save(newPost);
        UserInfoResponse userInfoResponse = UserInfoResponse.builder()
                .id(currentUser.getId())
                .firstName(currentUser.getFirstName())
                .lastName(currentUser.getLastName())
                .email(currentUser.getEmail())
                .avatarUrl(currentUser.getAvatarUrl())
                .build();

        List<PostResponse.PostMedia> postMedias = newPost.getPostMedias().stream().map(item ->
                PostResponse.PostMedia.builder()
                        .id(item.getId())
                        .url(item.getUrl())
                        .type(item.getType())
                        .build()).toList();

        notificationService.createPostNotification(newPost);

        return PostResponse.builder()
                .id(newPost.getId())
                .content(newPost.getContent())
                .author(userInfoResponse)
                .postMedia(postMedias)
                .build();
    }

    @Override
    public PageResponse<List<PostResponse>> getAllPosts(String search, int pageNo, int pageSize, String sort) {
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
        Page<Post> postPage = postRepository.findAll(search, pageable);

        List<PostResponse> postResponses = postPage.getContent().stream().map(postMapper::toPostResponse).toList();
        return PageResponse.<List<PostResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalPages(postPage.getTotalPages())
                .totalElements(postPage.getTotalElements())
                .data(postResponses)
                .build();
    }

    @Override
    public List<PostResponse> getPostsByCurrentUser(long userId) {
        List<Long> friendIds = friendShipRepository.findFriendIds(userId);
        friendIds.add(userId);
        int[] daysList = {7, 14, 30};

        List<Post> posts = new ArrayList<>();

        for (int days : daysList) {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(days);
            posts = postRepository.findRecentPostsOfUserAndFriends(friendIds, fromDate);

            if (!posts.isEmpty()) {
                break;
            }
        }

        return posts.stream().map(postMapper::toPostResponse).toList();
    }

    @Override
    public PageResponse<List<PostResponse>> getPostsByUser(long userId, int pageNo, int pageSize) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        int page = pageNo;
        if (pageNo > 0) {
            page = pageNo - 1;
        }
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "created_at"));
        Page<Post> postPage = postRepository.findByUser(user, pageable);

        List<PostResponse> posts = postPage.getContent()
                .stream().map(postMapper::toPostResponse).toList();

        return PageResponse.<List<PostResponse>>builder()
                .pageNo(pageNo)
                .pageSize(pageSize)
                .totalPages(postPage.getTotalPages())
                .data(posts)
                .build();
    }

    @Override
    public void deletePost(long postId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        if (!post.getUser().equals(user)) {
            throw new AuthorizationException("You don't have permission to delete this post");
        }
        postRepository.deleteById(postId);
    }

    @Override
    public PostResponse actionPost(long postId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));

        Optional<Like> existingLike = likeRepository.findByUserAndPost(currentUser, post);
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
        } else {
            Like like = Like.builder()
                    .user(currentUser)
                    .post(post)
                    .build();
            likeRepository.save(like);
        }

        int likeCount = likeRepository.countByPost(post);
        PostResponse postResponse = postMapper.toPostResponse(post);
        postResponse.setLikeCount(likeCount);

        return postResponse;
    }

    @Override
    public PostResponse getPostById(long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        return postMapper.toPostResponse(post);
    }
}
