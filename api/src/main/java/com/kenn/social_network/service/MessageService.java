package com.kenn.social_network.service;

import com.kenn.social_network.domain.Like;
import com.kenn.social_network.dto.request.message.SendMessageRequest;
import com.kenn.social_network.dto.response.message.MessageResponse;

import java.util.List;

public interface MessageService {

    MessageResponse sendMessage(SendMessageRequest sendMessageRequest);

    List<MessageResponse> getAllChat(long userId);
}
