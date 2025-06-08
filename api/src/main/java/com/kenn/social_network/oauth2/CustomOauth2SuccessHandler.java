package com.kenn.social_network.oauth2;

import com.kenn.social_network.domain.User;
import com.kenn.social_network.enums.TokenTypeEnum;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.security.CustomUserDetails;
import com.kenn.social_network.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomOauth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${fe.uri}")
    private String redirectUri;

    @Value("${jwt.refresh-token-duration}")
    private long jwtRefreshTokenDuration;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        handle(request, response, authentication);
        super.clearAuthenticationAttributes(request);
    }

    @Override
    protected void handle(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        String accessToken = jwtUtil.generateToken(currentUser, TokenTypeEnum.ACCESS_TOKEN);
        String refreshToken = jwtUtil.generateToken(currentUser, TokenTypeEnum.REFRESH_TOKEN);

        currentUser.setRefreshToken(refreshToken);
        userRepository.save(currentUser);

        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtRefreshTokenDuration);
        response.addCookie(cookie);

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri + "/oauth2/success")
                .queryParam("token", accessToken)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
