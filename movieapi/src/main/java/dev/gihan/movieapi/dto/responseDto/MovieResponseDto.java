package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

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
    private String trailerUrl;
    private String genre;
    private Double imdbRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long viewCount;
    private Boolean featured;
    private Boolean trending;

} 