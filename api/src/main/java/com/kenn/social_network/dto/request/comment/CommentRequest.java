package com.kenn.social_network.dto.request.comment;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {

    @NotBlank(message = "Comment can not be blank")
    private String comment;

    private Long parentId;
}
