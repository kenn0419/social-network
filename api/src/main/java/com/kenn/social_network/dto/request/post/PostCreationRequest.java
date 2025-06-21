package com.kenn.social_network.dto.request.post;


import com.kenn.social_network.enums.PostTypeEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PostCreationRequest {

    private Long groupId;

    @NotNull(message = "Content can not be blank")
    private String content;

    private PostTypeEnum postType;

    private List<MultipartFile> mediaFiles;
}
