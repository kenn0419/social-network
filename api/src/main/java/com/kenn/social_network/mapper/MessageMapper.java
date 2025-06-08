package com.kenn.social_network.mapper;

import com.kenn.social_network.domain.Message;
import com.kenn.social_network.dto.response.message.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class MessageMapper {
    private final UserMapper userMapper;

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .sender(userMapper.toUserResponse(message.getSender()))
                .receiver(userMapper.toUserResponse(message.getReceiver()))
                .content(message.getContent())
                .createdAt(Timestamp.from(Instant.now()))
                .build();
    }
}
