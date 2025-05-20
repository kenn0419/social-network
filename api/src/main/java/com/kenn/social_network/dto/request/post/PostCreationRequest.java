package com.kenn.social_network.dto.request.post;


import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PostCreationRequest {

    @NotNull(message = "Content can not be blank")
    private String content;

    @NotNull(message = "Media files can not be null")
    private List<MultipartFile> mediaFiles;
}
