package com.kenn.social_network.util;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class test {

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static void main(String[] args) {
        String test = "$2a$10$LD8zXx3hdN809S/8wyicfOE6.CKTl2FJ7Jm3bKbB5zns0kjS7/QKK";
        System.out.println(passwordEncoder.matches("123123az", test));
    }
}
