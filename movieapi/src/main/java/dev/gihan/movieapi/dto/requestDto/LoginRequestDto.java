package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String password;
}