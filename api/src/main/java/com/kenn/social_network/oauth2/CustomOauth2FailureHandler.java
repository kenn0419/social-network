package com.kenn.social_network.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class CustomOauth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${fe.uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri + "/oauth2")
                        .queryParam("error", "Something is wrong")
                        .build()
                        .toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
