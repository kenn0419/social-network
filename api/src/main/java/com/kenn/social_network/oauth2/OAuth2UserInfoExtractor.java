package com.kenn.social_network.oauth2;

import com.kenn.social_network.security.CustomUserDetails;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2UserInfoExtractor {

    CustomUserDetails extractUserInfo(OAuth2User oAuth2User);

    boolean accepts(OAuth2UserRequest userRequest);
}
