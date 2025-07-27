package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.LoginRequestDto;
import dev.gihan.movieapi.dto.responseDto.AuthResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.UserRepository;
import dev.gihan.movieapi.security.JwtTokenProvider;
import dev.gihan.movieapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    public AuthResponseDto login(LoginRequestDto loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            String token = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(loginRequest.getEmail());

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return AuthResponseDto.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400L) // 24 hours
                    .user(convertToUserInfo(user))
                    .build();

        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    @Override
    public AuthResponseDto refreshToken(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create new authentication for token generation
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    email, null,
                    java.util.Collections.singletonList(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    )
            );

            String newToken = tokenProvider.generateToken(auth);
            String newRefreshToken = tokenProvider.generateRefreshToken(email);

            return AuthResponseDto.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400L)
                    .user(convertToUserInfo(user))
                    .build();
        }
        throw new RuntimeException("Invalid refresh token");
    }

    @Override
    public void logout(String email) {
        // In a production environment, you might want to blacklist the token
        // For now, we'll just rely on the client to discard the token
    }

    @Override
    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    private AuthResponseDto.UserInfo convertToUserInfo(User user) {
        return AuthResponseDto.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}