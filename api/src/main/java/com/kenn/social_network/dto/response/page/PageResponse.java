package com.kenn.social_network.dto.response.page;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageResponse<T> {
    private int pageNo;

    private int pageSize;

    private int totalPages;

    private T data;
}
