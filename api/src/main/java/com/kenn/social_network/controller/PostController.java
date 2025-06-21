package com.kenn.social_network.controller;


import com.kenn.social_network.dto.request.post.PostCreationRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    SuccessResponse<PostResponse> createPost(@Valid @ModelAttribute PostCreationRequest postCreationRequest) {
        return SuccessResponse.<PostResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Create post successfully!!!")
                .data(postService.createPost(postCreationRequest))
                .build();
    }

    @GetMapping
    SuccessResponse<PageResponse<List<PostResponse>>> getAllPosts(
            @RequestParam(value = "search", defaultValue = "", required = false) String search,
            @RequestParam(value = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sort", defaultValue = "id,asc") String sort
    ) {
        return SuccessResponse.<PageResponse<List<PostResponse>>>builder()
                .message("Get all posts successfully!!!")
                .data(postService.getAllPosts(search, pageNo, pageSize, sort))
                .build();
    }

    @GetMapping("/user/{userId}")
    SuccessResponse<PageResponse<List<PostResponse>>> getAllPostsByUser(
            @PathVariable("userId") long userId,
            @RequestParam(value = "pageNo", required = false, defaultValue = "1") int pageNo,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSize
    ) {
        return SuccessResponse.<PageResponse<List<PostResponse>>>builder()
                .message("Get all posts by user successfully!!!")
                .data(postService.getPostsByUser(userId, pageNo, pageSize))
                .build();
    }

    @GetMapping("/current/{userId}")
    SuccessResponse<List<PostResponse>> getAllPostsByCurrentUser(@PathVariable("userId") long userId) {
        return SuccessResponse.<List<PostResponse>>builder()
                .message("Get all posts by user successfully!!!")
                .data(postService.getPostsByCurrentUser(userId))
                .build();
    }

    @DeleteMapping("/{postId}")
    SuccessResponse<Void> deletePost(@PathVariable("postId") long postId) {
        postService.deletePost(postId);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Delete post successfully!!!")
                .build();
    }

    @PostMapping("/{postId}/action")
    SuccessResponse<PostResponse> actionPost(@PathVariable("postId") long postId) {
        return SuccessResponse.<PostResponse>builder()
                .message("Like/Unlike post successfully!!!")
                .data(postService.actionPost(postId))
                .build();
    }

    @GetMapping("/{postId}")
    SuccessResponse<PostResponse> getPostById(@PathVariable("postId") long postId) {
        return SuccessResponse.<PostResponse>builder()
                .message("Get post by id successfully!!!")
                .data(postService.getPostById(postId))
                .build();
    }
}
