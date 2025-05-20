package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.message.SendMessageRequest;
import com.kenn.social_network.dto.response.message.MessageResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    // Gửi tin nhắn
    @PostMapping
    SuccessResponse<MessageResponse> sendMessage(@RequestBody SendMessageRequest sendMessageRequest) {
        return SuccessResponse.<MessageResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Send message successfully!!!")
                .data(messageService.sendMessage(sendMessageRequest))
                .build();
    }

    @GetMapping("/{userId}")
    SuccessResponse<List<MessageResponse>> getChat(@PathVariable Long userId) {
        return SuccessResponse.<List<MessageResponse>>builder()
                .message("Get all messages of conversation successfully!!!")
                .data(messageService.getAllChat(userId))
                .build();
    }
} 