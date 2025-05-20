package com.kenn.social_network.service;

import com.kenn.social_network.dto.response.message.ConversationResponse;
import java.util.List;

public interface ConversationService {
    List<ConversationResponse> getConversations(int page, int size);
} 