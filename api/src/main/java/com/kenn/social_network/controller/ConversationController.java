package com.kenn.social_network.controller;

import com.kenn.social_network.dto.response.message.ConversationResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;

    @GetMapping
    SuccessResponse<List<ConversationResponse>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return SuccessResponse.<List<ConversationResponse>>builder()
                .message("Get all conservation successfully!!!")
                .data(conversationService.getConversations(page, size))
                .build();
    }

//    @GetMapping("/{userId}")
//    SuccessResponse<List<ConversationResponse>> getConverstaionByUserId() {
//        return SuccessResponse.<List<ConversationResponse>>builder()
//                .message("Get all conservation successfully!!!")
//                .data(conversationService.getConversations(page, size))
//                .build();
//    }

} 