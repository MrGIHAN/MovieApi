package dev.gihan.movieapi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {
    private String secret = "movieApiSecretKeyForJWTTokenGeneration2024!@#$%";
    private long expiration = 86400000; // 24 hours in milliseconds
    private long refreshExpiration = 604800000; // 7 days in milliseconds
    private String tokenPrefix = "Bearer ";
    private String headerString = "Authorization";
}