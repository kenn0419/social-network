package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Role;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.request.auth.AuthLoginRequest;
import com.kenn.social_network.dto.request.auth.AuthRegisterRequest;
import com.kenn.social_network.dto.response.auth.AuthResponse;
import com.kenn.social_network.enums.RoleEnum;
import com.kenn.social_network.enums.TokenType;
import com.kenn.social_network.enums.UserStatus;
import com.kenn.social_network.exception.EmailAlreadyExistsException;
import com.kenn.social_network.exception.ExpiredTokenVerifyAccountException;
import com.kenn.social_network.exception.RefreshTokenInvalidException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.repository.RoleRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.AuthService;
import com.kenn.social_network.util.*;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${jwt.refresh-token-duration}")
    private long refreshTokenDuration;

    private final ConvertUtil convertUtil;
    private final MessageUtil messageUtil;
    private final RedisUtil redisUtil;
    private final MailUtil mailUtil;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Override
    public void register(AuthRegisterRequest authRegisterRequest) {
        boolean isExistUser = userRepository.existsByEmail(authRegisterRequest.getEmail());
        if (isExistUser) {
            throw new EmailAlreadyExistsException(messageUtil.get("email.exists"));
        }

        User registerUser = convertUtil.toUser(authRegisterRequest);
        String token = UUID.randomUUID().toString();
        redisUtil.saveVerificationToken(token, registerUser);

        Map<String, String> value = new HashMap<>();
        value.put("title", "Verify Account");
        value.put("verificationCode", token);
        mailUtil.sendEmailFromTemplateSync(
                registerUser.getEmail(),
                "Những trải nghiệm tuyệt vời đang chờ bạn, khám phá ngay hôm nay!",
                "email_verify",
                value
        );
        log.info("SEND VERIFY LINK SUCCESSFULLY!!!");
    }

    @Override
    public void verifyAccount(String token) {
        User user = (User)redisUtil.getInfoByToken(token);

        if (user != null) {
            user.setStatus(UserStatus.ACTIVE);
            Role userRole = roleRepository.findByName(RoleEnum.USER.name());
            user.setRole(userRole);
            userRepository.save(user);
            redisUtil.deleteToken(token);
        }else {
            throw new ExpiredTokenVerifyAccountException(messageUtil.get("user.register.verify-account"));
        }
    }

    @Override
    public Map<String, Object> authenticate(AuthLoginRequest authLoginRequest) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                authLoginRequest.getEmail(),
                authLoginRequest.getPassword()
        );
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(authLoginRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String accessToken = jwtUtil.generateToken(user, TokenType.ACCESS_TOKEN);
        String refreshToken = jwtUtil.generateToken(user, TokenType.REFRESH_TOKEN);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) refreshTokenDuration);

        AuthResponse authResponse = AuthResponse.builder()
                .user(convertUtil.toAuthResponseUser(user))
                .accessToken(accessToken)
                .build();

        Map<String, Object> authenticationResult = new HashMap<>();
        authenticationResult.put("cookie", cookie);
        authenticationResult.put("auth", authResponse);

        return authenticationResult;
    }

    @Override
    public AuthResponse.User fetchCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return convertUtil.toAuthResponseUser(currentUser);
    }

    @Override
    public Map<String, Object> createNewRefreshToken(String refreshToken) {
        Jwt encodeToken = jwtUtil.validateToken(refreshToken);
        String email = encodeToken.getSubject();
        User existUser = userRepository.findByEmailAndRefreshToken(email, refreshToken)
                .orElseThrow(() -> new RefreshTokenInvalidException("Refresh token is not valid"));

        String accessToken = jwtUtil.generateToken(existUser, TokenType.ACCESS_TOKEN);
        String newRefreshToken = jwtUtil.generateToken(existUser, TokenType.REFRESH_TOKEN);

        existUser.setRefreshToken(newRefreshToken);
        userRepository.save(existUser);


        Cookie cookie = new Cookie("refresh_token", newRefreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) refreshTokenDuration);

        AuthResponse authResponse = AuthResponse.builder()
                .user(convertUtil.toAuthResponseUser(existUser))
                .accessToken(accessToken)
                .build();

        Map<String, Object> authenticationResult = new HashMap<>();
        authenticationResult.put("cookie", cookie);
        authenticationResult.put("auth", authResponse);

        return authenticationResult;
    }

    @Override
    public void logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setRefreshToken(null);
        userRepository.save(user);
    }
}
