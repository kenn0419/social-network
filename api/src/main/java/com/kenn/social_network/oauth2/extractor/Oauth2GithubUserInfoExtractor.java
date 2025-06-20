package com.kenn.social_network.oauth2.extractor;

import com.kenn.social_network.enums.Oauth2ProviderEnum;
import com.kenn.social_network.enums.RoleEnum;
import com.kenn.social_network.oauth2.OAuth2UserInfoExtractor;
import com.kenn.social_network.security.CustomUserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class Oauth2GithubUserInfoExtractor implements OAuth2UserInfoExtractor {
    @Override
    public CustomUserDetails extractUserInfo(OAuth2User oAuth2User) {
        String name = retrieveAttr("name", oAuth2User);
        String[] parts = name.split("\\s+");
        return CustomUserDetails.builder()
                .avatarUrl(retrieveAttr("picture", oAuth2User))
                .firstName(parts[parts.length - 1])
                .lastName(parts[0])
                .provider(Oauth2ProviderEnum.GITHUB)
                .avatarUrl(retrieveAttr("avatar_url", oAuth2User))
                .attributes(oAuth2User.getAttributes())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + RoleEnum.USER.name())))
                .build();
    }

    @Override
    public boolean accepts(OAuth2UserRequest userRequest) {
        return Oauth2ProviderEnum.GITHUB.name().equalsIgnoreCase(userRequest.getClientRegistration().getRegistrationId());
    }

    private String retrieveAttr(String attr, OAuth2User oAuth2User) {
        Object attribute = oAuth2User.getAttributes().get(attr);
        return attribute == null ? "" : attribute.toString();
    }
}
