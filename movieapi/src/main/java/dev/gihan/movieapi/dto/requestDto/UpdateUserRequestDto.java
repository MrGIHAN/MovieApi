package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

@Data
public class UpdateUserRequestDto {
    private String firstName;
    private String lastName;
    private String currentPassword;
    private String newPassword;
}
