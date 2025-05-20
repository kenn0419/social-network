package com.kenn.social_network.dto.request.auth;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRegisterRequest {

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
}
