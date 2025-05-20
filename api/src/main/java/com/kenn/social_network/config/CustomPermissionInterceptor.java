package com.kenn.social_network.config;

import com.kenn.social_network.domain.Permission;
import com.kenn.social_network.domain.Role;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.exception.AuthorizationException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.List;


@Component
@RequiredArgsConstructor
public class CustomPermissionInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String httpMethod = request.getMethod();
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String path = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);

        if (!path.startsWith("/api/v1/auth/**")) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            Role role = user.getRole();

            if (role != null) {
                List<Permission> permissions = role.getPermissions();
                boolean isAllow = permissions.stream().anyMatch(permission ->
                        permission.getPath().equals(path) && permission.getMethod().name().equals(httpMethod));

                if (!isAllow) {
                    throw new AuthorizationException("You don't have the permission to access.");
                }
            }else {
                throw new AuthorizationException("You don't have the permission to access.");

            }
        }

        return true;
    }
}
