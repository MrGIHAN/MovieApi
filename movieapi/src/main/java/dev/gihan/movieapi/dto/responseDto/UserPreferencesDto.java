package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPreferencesDto {

    private String theme = "light";
    private String language = "en";
    private boolean notifications = true;
    private String[] favoriteGenres = {};

}