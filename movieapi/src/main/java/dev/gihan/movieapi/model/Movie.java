package dev.gihan.movieapi.model;

import dev.gihan.movieapi.model.option.Genre;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "movies", indexes = {
    @Index(name = "idx_movie_title", columnList = "title"),
    @Index(name = "idx_movie_genre", columnList = "genre"),
    @Index(name = "idx_movie_release_year", columnList = "release_year"),
    @Index(name = "idx_movie_imdb_rating", columnList = "imdb_rating"),
    @Index(name = "idx_movie_featured", columnList = "featured"),
    @Index(name = "idx_movie_trending", columnList = "trending"),
    @Index(name = "idx_movie_created_at", columnList = "created_at")
})
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false, length = 255)
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(value = 1900, message = "Release year must be after 1900")
    @Max(value = 2100, message = "Release year must be before 2100")
    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "duration_minutes")
    private Duration duration;

    @NotBlank(message = "Video URL is required")
    @Size(max = 500, message = "Video URL must not exceed 500 characters")
    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl;

    @Size(max = 500, message = "Thumbnail URL must not exceed 500 characters")
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Size(max = 500, message = "Poster URL must not exceed 500 characters")
    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @NotNull(message = "Genre is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genre genre;

    @DecimalMin(value = "0.0", message = "IMDB rating must be at least 0.0")
    @DecimalMax(value = "10.0", message = "IMDB rating must not exceed 10.0")
    @Column(name = "imdb_rating", precision = 3, scale = 1)
    private Double imdbRating;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WatchHistory> watchHistories = new ArrayList<>();

    @Size(max = 500, message = "Trailer URL must not exceed 500 characters")
    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Min(value = 0, message = "View count cannot be negative")
    @Column(name = "view_count", columnDefinition = "BIGINT DEFAULT 0", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

    @Column(name = "trending", nullable = false)
    private Boolean trending = false;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StreamingSession> streamingSessions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (viewCount == null) {
            viewCount = 0L;
        }
        if (featured == null) {
            featured = false;
        }
        if (trending == null) {
            trending = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to increment view count
    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0L : this.viewCount) + 1;
    }
}