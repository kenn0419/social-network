package com.kenn.social_network.service;

import com.kenn.social_network.dto.request.auth.AuthLoginRequest;
import com.kenn.social_network.dto.request.auth.AuthRegisterRequest;
import com.kenn.social_network.dto.response.auth.AuthResponse;

import java.util.Map;

public interface AuthService {

    void register(AuthRegisterRequest authRegisterRequest);

    void verifyAccount(String token);

    Map<String, Object> authenticate(AuthLoginRequest authLoginRequest);

    AuthResponse.User fetchCurrentUser();

    Map<String, Object> createNewRefreshToken(String token);

    void logout();
}
