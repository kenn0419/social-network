package com.kenn.social_network.service;

import com.kenn.social_network.dto.request.comment.CommentRequest;
import com.kenn.social_network.dto.response.comment.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse commentPost(long postId, CommentRequest commentRequest);

    List<CommentResponse> getCommentsByPost(long postId);

    List<CommentResponse> getRepliesByCommentId(long parentCommentId);
}
