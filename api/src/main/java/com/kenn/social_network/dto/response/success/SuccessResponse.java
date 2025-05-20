package com.kenn.social_network.dto.response.success;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuccessResponse<T> {
    @Builder.Default
    private int statusCode = 200;

    private String message;

    private T data;
}
