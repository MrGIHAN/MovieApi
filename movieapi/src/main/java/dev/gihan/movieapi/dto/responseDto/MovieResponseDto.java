package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieResponseDto {

    private Long id;
    private String title;
    private String description;
    private Integer releaseYear;
    private String duration; // ISO-8601 or formatted string
    private String videoUrl;
    private String thumbnailUrl;
    private String posterUrl;
    private String genre;
    private Double imdbRating;

} 