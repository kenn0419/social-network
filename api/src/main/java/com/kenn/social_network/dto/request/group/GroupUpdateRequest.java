package com.kenn.social_network.dto.request.group;

import com.kenn.social_network.enums.GroupStatusEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class GroupUpdateRequest {
    @NotBlank(message = "{group.id.notBlank}")
    private long id;

    @NotBlank(message = "{group.name.notBlank}")
    private String name;

    private String description;

    private GroupStatusEnum groupStatus;

    private List<Long> memberIds;

    private MultipartFile coverImage;
}
