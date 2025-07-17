package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {

    private String id;
    private String email;
    private String name;
    private String avatarUrl;

    private List<Long> watchlist; // Movie IDs
    private List<Long> history;   // Movie IDs
    private List<Long> favorites; // ✅ NEW

    private UserPreferencesDto preferences;

}
