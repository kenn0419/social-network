package com.kenn.social_network.dto.response.error;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse<T> {
    private LocalDateTime timestamp = LocalDateTime.now();

    private String path;

    private int statusCode;

    private T errors;
}
