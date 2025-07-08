package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPreferencesDto {
    private String theme; // "light" or "dark"
    private List<String> favoriteGenres;
    private String language;
} 