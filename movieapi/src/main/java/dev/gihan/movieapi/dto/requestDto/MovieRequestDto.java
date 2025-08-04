package dev.gihan.movieapi.dto.requestDto;

import dev.gihan.movieapi.model.option.Genre;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovieRequestDto {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @Min(value = 1900, message = "Release year must be after 1900")
    @Max(value = 2100, message = "Release year must be before 2100")
    private Integer releaseYear;
    
    private Duration duration;
    
    @NotBlank(message = "Video URL is required")
    @Size(max = 500, message = "Video URL must not exceed 500 characters")
    private String videoUrl;
    
    @Size(max = 500, message = "Thumbnail URL must not exceed 500 characters")
    private String thumbnailUrl;
    
    @Size(max = 500, message = "Poster URL must not exceed 500 characters")
    private String posterUrl;

    @NotNull(message = "Genre is required")
    @Enumerated(EnumType.STRING)
    private Genre genre;

    @DecimalMin(value = "0.0", message = "IMDB rating must be at least 0.0")
    @DecimalMax(value = "10.0", message = "IMDB rating must not exceed 10.0")
    private Double imdbRating;

}
