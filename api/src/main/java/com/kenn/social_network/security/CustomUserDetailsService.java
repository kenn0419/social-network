package com.kenn.social_network.security;

import com.kenn.social_network.enums.RoleEnum;
import com.kenn.social_network.enums.UserStatusEnum;
import com.kenn.social_network.exception.AccountBlockException;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service("userDetailsService")
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MessageUtil messageUtil;
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.kenn.social_network.domain.User existUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (existUser.getStatus() == UserStatusEnum.BLOCK) {
            throw new AccountBlockException(messageUtil.get("user.is-block"));
        }

        return toCustomUserDetails(existUser);
    }

    private CustomUserDetails toCustomUserDetails(com.kenn.social_network.domain.User user) {
        return CustomUserDetails.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())))
                .build();
    }
}
