package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Message;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.message.SendMessageRequest;
import com.kenn.social_network.dto.response.message.MessageResponse;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.mapper.MessageMapper;
import com.kenn.social_network.mapper.UserMapper;
import com.kenn.social_network.repository.MessageRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.MessageService;
import com.kenn.social_network.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final UserMapper userMapper;
    private final MessageMapper messageMapper;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    public MessageResponse sendMessage(SendMessageRequest sendMessageRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User receiver = userRepository.findById(sendMessageRequest.getReceiverId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        String content = sendMessageRequest.getContent();


        Message message = Message.builder()
                .sender(currentUser)
                .receiver(receiver)
                .content(content)
                .build();

        messageRepository.save(message);

        MessageResponse response = messageMapper.toMessageResponse(message);

        // Gửi realtime qua websocket cho receiver
        messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/messages",
                response
        );
        // Gửi cho sender luôn (nếu muốn cập nhật UI ngay)
        messagingTemplate.convertAndSendToUser(
                currentUser.getId().toString(),
                "/queue/messages",
                response
        );
        return response;
    }

    @Override
    public List<MessageResponse> getAllChat(long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Message> messages = messageRepository.findChatBetween(currentUser.getId(), userId);
        return messages.stream().map(m -> MessageResponse.builder()
                .sender(userMapper.toUserResponse(m.getSender()))
                .receiver(userMapper.toUserResponse(m.getReceiver()))
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build()
        ).toList();
    }
}
