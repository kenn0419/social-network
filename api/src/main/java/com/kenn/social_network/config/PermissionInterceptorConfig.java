//package com.kenn.social_network.config;
//
//import com.kenn.social_network.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//
//@Configuration
//@RequiredArgsConstructor
//public class PermissionInterceptorConfig implements WebMvcConfigurer {
//
//    private  final UserRepository userRepository;
//
//    @Bean
//    public CustomPermissionInterceptor customPermissionInterceptor(UserRepository userRepository) {
//        return new CustomPermissionInterceptor(userRepository);
//    }
//
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        String[] whiteList = new String[] {
//            "/api/v1/auth/verify-account/**", "/api/v1/auth/login", "/api/v1/auth/register"
//        };
//
//        registry.addInterceptor(customPermissionInterceptor(userRepository)).excludePathPatterns(whiteList);
//    }
//}
