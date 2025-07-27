package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.requestDto.LoginRequestDto;
import dev.gihan.movieapi.dto.responseDto.AuthResponseDto;

public interface AuthService {
    AuthResponseDto login(LoginRequestDto loginRequest);
    AuthResponseDto refreshToken(String refreshToken);
    void logout(String email);
    boolean validateToken(String token);
}