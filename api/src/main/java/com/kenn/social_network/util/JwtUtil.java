package com.kenn.social_network.util;

import com.kenn.social_network.domain.User;
import com.kenn.social_network.dto.response.auth.UserToken;
import com.kenn.social_network.enums.TokenType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;


@Component
@RequiredArgsConstructor
public class JwtUtil {
    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${jwt.signed-key}")
    private String signedKey;

    @Value("${jwt.access-token-duration}")
    private long accessTokenDuration;

    @Value("${jwt.refresh-token-duration}")
    private long refreshTokenDuration;

    private final JwtEncoder jwtEncoder;

    public String generateToken(User user, TokenType tokenType) {
        UserToken userToken = UserToken.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        long duration = tokenType == TokenType.ACCESS_TOKEN ? accessTokenDuration : refreshTokenDuration;
        Instant now = Instant.now();
        Instant validity = now.plus(duration, ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(user.getEmail())
                .id(UUID.randomUUID().toString())
                .claim("data", userToken)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public Jwt validateToken(String token) {
        SecretKey secretKey = getSecretKey(signedKey, JWT_ALGORITHM.getName());
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(JWT_ALGORITHM).build();
        try {
            return jwtDecoder.decode(token);
        } catch (Exception e) {
            System.out.println(">>> Refresh token error: " + e.getMessage());
            throw e;
        }
    }

    public static SecretKey getSecretKey(String jwtKey, String algorithm) {
        byte[] keyBytes = Base64.getDecoder().decode(jwtKey);
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, algorithm);
    }
}
