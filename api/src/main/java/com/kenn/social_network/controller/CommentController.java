package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.comment.CommentRequest;
import com.kenn.social_network.dto.response.comment.CommentResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}")
    SuccessResponse<CommentResponse> commentPost(@PathVariable("postId") long postId,
                                                 @Valid @RequestBody CommentRequest commentRequest) {
        return SuccessResponse.<CommentResponse>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Comment post successfully!!!")
                .data(commentService.commentPost(postId, commentRequest))
                .build();
    }

    @GetMapping("/posts/{postId}")
    SuccessResponse<List<CommentResponse>> getCommentsPost(@PathVariable("postId") long postId) {
        return SuccessResponse.<List<CommentResponse>>builder()
                .message("Get all comments of post successfully!!!")
                .data(commentService.getCommentsByPost(postId))
                .build();
    }

    @GetMapping("/{commentId}/replies")
    SuccessResponse<List<CommentResponse>> getReplies(@PathVariable("commentId") long commentId) {
        return SuccessResponse.<List<CommentResponse>>builder()
                .message("Get all replies of comment successfully!!!")
                .data(commentService.getRepliesByCommentId(commentId))
                .build();
    }

}
