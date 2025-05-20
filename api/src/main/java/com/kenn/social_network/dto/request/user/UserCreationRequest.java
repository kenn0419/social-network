package com.kenn.social_network.dto.request.user;

import com.kenn.social_network.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UserCreationRequest {
    @NotBlank(message = "{user.firstName.notBlank}")
    private String firstName;

    @NotBlank(message = "{user.lastName.notBlank}")
    private String lastName;

    @NotBlank(message = "{user.email.notBlank}")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "{user.email.invalid}")
    private String email;

    @NotBlank(message = "{user.password.notBlank}")
    private String password;

    @NotBlank(message = "{user.address.notBlank}")
    private String address;

    @NotNull(message = "{user.avatar.notNull}")
    private MultipartFile avatar;

    @NotNull(message = "{user.coverImage.notNull}")
    private MultipartFile coverImage;

    private String bio;

    private UserStatus status;
}
