package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.auth.AuthLoginRequest;
import com.kenn.social_network.dto.request.auth.AuthRegisterRequest;
import com.kenn.social_network.dto.response.auth.AuthResponse;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    @Value("${fe.verify-success}")
    private String FE_LINK_VERIFY_SUCCESS;

    private final AuthService authService;

    @PostMapping("/register")
    SuccessResponse<Void> register(@Valid @RequestBody AuthRegisterRequest authRegisterRequest) {
        authService.register(authRegisterRequest);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Register successfully. Please check email to verify account!!!")
                .data(null)
                .build();
    }

    @GetMapping("/verify-account/{token}")
    SuccessResponse<Void> verifyAccount(@PathVariable("token") String token, HttpServletResponse response) throws IOException {
        authService.verifyAccount(token);
        response.sendRedirect(FE_LINK_VERIFY_SUCCESS);
        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Verify successfully. You have accessed your account!!!")
                .data(null)
                .build();
    }

    @PostMapping("/login")
    SuccessResponse<AuthResponse> login(@Valid @RequestBody AuthLoginRequest authLoginRequest, HttpServletResponse response) {
        Map<String, Object> authenticationResult = authService.authenticate(authLoginRequest);

        response.addCookie((Cookie) authenticationResult.get("cookie"));
        return SuccessResponse.<AuthResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Login successfully!!!")
                .data((AuthResponse) authenticationResult.get("auth"))
                .build();
    }

    @GetMapping("/me")
    SuccessResponse<AuthResponse.User> getCurrentUser() {
        return SuccessResponse.<AuthResponse.User>builder()
                .message("Get current user data successfully!!!")
                .data(authService.fetchCurrentUser())
                .build();
    }

    @GetMapping("/refresh")
    SuccessResponse<AuthResponse> createNewRefreshToken(@CookieValue(value = "refresh_token") String refreshToken,
                                                        HttpServletResponse response) {
        Map<String, Object> authenticationResult = authService.createNewRefreshToken(refreshToken);

        response.addCookie((Cookie) authenticationResult.get("cookie"));
        return SuccessResponse.<AuthResponse>builder()
                .message("Generate new refresh token successfully!!!")
                .data((AuthResponse) authenticationResult.get("auth"))
                .build();
    }

    @PostMapping("/logout")
    SuccessResponse<Void> logout(HttpServletResponse response) {
        authService.logout();
        Cookie deleteCookie = new Cookie("refresh_token", "");
        deleteCookie.setHttpOnly(true);
        deleteCookie.setSecure(true);
        deleteCookie.setPath("/");
        deleteCookie.setMaxAge(0);

        response.addCookie(deleteCookie);
        return SuccessResponse.<Void>builder()
                .message("Logout successfully!!!")
                .data(null)
                .build();
    }

}
