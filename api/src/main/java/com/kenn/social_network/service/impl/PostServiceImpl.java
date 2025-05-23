package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Like;
import com.kenn.social_network.domain.Post;
import com.kenn.social_network.domain.PostMedia;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.post.PostCreationRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.user.UserInfoResponse;
import com.kenn.social_network.enums.MediaType;
import com.kenn.social_network.exception.AuthorizationException;
import com.kenn.social_network.exception.PostNotFoundException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.repository.*;
import com.kenn.social_network.service.CloudinaryService;
import com.kenn.social_network.service.PostService;
import com.kenn.social_network.util.ConvertUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final ConvertUtil convertUtil;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final FriendShipRepository friendShipRepository;

    @Override
    public PostResponse createPost(PostCreationRequest postCreationRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Post newPost = Post.builder()
                .content(postCreationRequest.getContent())
                .user(currentUser)
                .build();

        List<PostMedia> mediaList = postCreationRequest.getMediaFiles().stream().map(item -> {
            String mediaUrl = null;
            MediaType mediaType = null;
            if (item.getContentType() != null && item.getContentType().startsWith("image/")) {
                try {
                    Map imageResult = cloudinaryService.uploadFile(item, "social-network/post/image");
                    mediaUrl = (String) imageResult.get("secure_url");
                    mediaType = MediaType.IMAGE;
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            } else {
                try {
                    Map videoResult = cloudinaryService.uploadVideo(item, "social-network/post/video");
                    mediaUrl = (String) videoResult.get("secure_url");
                    mediaType = MediaType.VIDEO;
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }

            }

            return PostMedia.builder()
                    .url(mediaUrl)
                    .type(mediaType)
                    .post(newPost)
                    .build();
        }).toList();

        newPost.getPostMedias().addAll(mediaList);
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

        return PostResponse.builder()
                .id(newPost.getId())
                .content(newPost.getContent())
                .author(userInfoResponse)
                .postMedia(postMedias)
                .build();
    }

    @Override
    public List<PostResponse> getPostsByCurrentUser(long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
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

        return posts.stream().map(post -> convertUtil.toPostResponse(post, currentUser)).toList();
    }

    @Override
    public PageResponse<List<PostResponse>> getPostsByUser(long userId, int pageNo, int pageSize) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        int page = pageNo;
        if (pageNo > 0) {
            page = pageNo - 1;
        }
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "created_at"));
        Page<Post> postPage = postRepository.findByUser(user, pageable);

        List<PostResponse> posts = postPage.getContent()
                .stream().map(post -> convertUtil.toPostResponse(post, currentUser)).toList();

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
        PostResponse postResponse = convertUtil.toPostResponse(post, currentUser);
        postResponse.setLikeCount(likeCount);

        return postResponse;
    }
}
