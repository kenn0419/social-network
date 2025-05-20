package com.kenn.social_network.service;

import com.kenn.social_network.enums.UserStatus;
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

import java.util.Collection;
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
        if (existUser.getStatus() == UserStatus.BLOCK) {
            throw new AccountBlockException(messageUtil.get("user.is-block"));
        }
        return new User(
            existUser.getEmail(),
            existUser.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + existUser.getRole().getName()))
        );
    }
}
