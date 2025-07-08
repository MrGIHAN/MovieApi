package dev.gihan.movieapi.dto.requestDto;

import dev.gihan.movieapi.model.option.Genre;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovieRequestDto {

    private String title;
    private String description;
    private Integer releaseYear;
    private Duration duration;
    private String videoUrl;
    private String thumbnailUrl;
    private String posterUrl;

    @Enumerated(EnumType.STRING)
    private Genre genre;

    private Double imdbRating;

}
