package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnhancedMovieResponseDto {
    private Long id;
    private String title;
    private String description;
    private Integer releaseYear;
    private String duration;
    private String videoUrl;
    private String thumbnailUrl;
    private String posterUrl;
    private String trailerUrl;
    private String genre;
    private Double imdbRating;
    private LocalDateTime createdAt;

    // Enhanced fields
    private MovieStatsDto stats;
    private List<CommentResponseDto> recentComments;
    private List<EnhancedMovieResponseDto> similarMovies;

    // User-specific fields (only when user is authenticated)
    private Boolean isFavorite;
    private Boolean isInWatchLater;
    private Integer watchProgress; // in seconds
    private Boolean hasWatched;
}