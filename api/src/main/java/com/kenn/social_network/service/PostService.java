package com.kenn.social_network.service;

import com.kenn.social_network.dto.request.post.PostCreationRequest;
import com.kenn.social_network.dto.response.page.PageResponse;
import com.kenn.social_network.dto.response.post.PostResponse;

import java.util.List;

public interface PostService {

    PostResponse createPost(PostCreationRequest postCreationRequest);

    PageResponse<List<PostResponse>> getAllPosts(String search, int pageNo, int pageSize, String sort);

    List<PostResponse> getPostsByCurrentUser(long userId);

    PageResponse<List<PostResponse>> getPostsByUser(long userId, int pageNo, int pageSize);

    void deletePost(long postId);

    PostResponse actionPost(long postId);

    PostResponse getPostById(long postId);
}
