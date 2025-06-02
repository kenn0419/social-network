package com.kenn.social_network.oauth2;

import com.kenn.social_network.domain.Role;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.enums.RoleEnum;
import com.kenn.social_network.repository.RoleRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final List<OAuth2UserInfoExtractor> oAuth2UserInfoExtractors;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Optional<OAuth2UserInfoExtractor> oAuth2UserInfoExtractorOptional =
                oAuth2UserInfoExtractors.stream()
                        .filter(oAuth2UserInfoExtractor -> oAuth2UserInfoExtractor.accepts(userRequest))
                        .findFirst();
        if (oAuth2UserInfoExtractorOptional.isEmpty()) {
            throw new OAuth2AuthenticationException("The OAuth2 provider is not supported yet");
        }
        CustomUserDetails customUserDetails = oAuth2UserInfoExtractorOptional.get().extractUserInfo(oAuth2User);
        User user = upsertUser(customUserDetails);
        customUserDetails.setId(user.getId());
        return customUserDetails;
    }

    private User upsertUser(CustomUserDetails customUserDetails) {
        Optional<User> optionalUser = userRepository.findByEmail(customUserDetails.getEmail());
        User user = null;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            user.setEmail(customUserDetails.getEmail());
        } else {
            user = User.builder()
                    .email(customUserDetails.getEmail())
                    .firstName(customUserDetails.getFirstName())
                    .lastName(customUserDetails.getLastName())
                    .avatarUrl(customUserDetails.getAvatarUrl())
                    .provider(customUserDetails.getProvider())
                    .build();

            Role existRole = roleRepository.findByName(RoleEnum.USER.name());
            user.setRole(existRole);
        }
        // TODO: add new image here
        return userRepository.save(user);
    }
}
