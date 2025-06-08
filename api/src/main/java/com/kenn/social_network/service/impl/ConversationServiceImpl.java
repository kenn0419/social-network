package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Message;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.message.ConversationResponse;
import com.kenn.social_network.mapper.MessageMapper;
import com.kenn.social_network.mapper.UserMapper;
import com.kenn.social_network.repository.MessageRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
    private final UserMapper userMapper;
    private final MessageMapper messageMapper;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public List<ConversationResponse> getConversations(int page, int size) {
        // Lấy user hiện tại
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy danh sách tin nhắn gần nhất với mỗi user khác
        List<Message> latestMessages = messageRepository.findLatestMessagesByUser(
                currentUser.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        // Lấy danh sách user tham gia hội thoại
        List<Long> participantIds = latestMessages.stream()
                .map(msg -> msg.getSender().getId().equals(currentUser.getId()) 
                        ? msg.getReceiver().getId() 
                        : msg.getSender().getId())
                .toList();

        Map<Long, User> participants = userRepository.findAllById(participantIds)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Map sang ConversationResponse
        return latestMessages.stream()
                .map(msg -> {
                    User participant = msg.getSender().getId().equals(currentUser.getId())
                            ? participants.get(msg.getReceiver().getId())
                            : participants.get(msg.getSender().getId());

                    return ConversationResponse.builder()
                            .id(msg.getId())
                            .participant(userMapper.toUserResponse(participant))
                            .lastMessage(messageMapper.toMessageResponse(msg))
                            .lastMessageTime(msg.getCreatedAt())
                            .unRead(!msg.getSender().getId().equals(currentUser.getId()) && !msg.isUnRead())
                            .build();
                })
                .toList();
    }
} 