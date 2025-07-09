package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

@Data
public class UserRequestDto {

    private String email;
    private String password;
    private String firstName;
    private String lastName;

} 