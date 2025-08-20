package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.dto.responseDto.MovieResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieServiceImpl implements MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public MovieResponseDto createMovie(MovieRequestDto movieRequestDto) {

        Movie movie = new Movie();
        movie.setTitle(movieRequestDto.getTitle());
        movie.setDescription(movieRequestDto.getDescription());
        movie.setReleaseYear(movieRequestDto.getReleaseYear());
        movie.setDuration(movieRequestDto.getDuration());
        movie.setVideoUrl(movieRequestDto.getVideoUrl());
        movie.setThumbnailUrl(movieRequestDto.getThumbnailUrl());
        movie.setPosterUrl(movieRequestDto.getPosterUrl());
        movie.setGenre(movieRequestDto.getGenre());
        movie.setImdbRating(
                movieRequestDto.getImdbRating() != null ? BigDecimal.valueOf(movieRequestDto.getImdbRating()) : null);

        Movie savedMovie = movieRepository.save(movie);
        return convertToMovieResponseDto(savedMovie);
    }

    @Override
    public MovieResponseDto updateMovie(Long id, MovieRequestDto movieRequestDto) throws NotFoundException {

        Movie movie = movieRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Movie not found"));

        movie.setTitle(movieRequestDto.getTitle());
        movie.setDescription(movieRequestDto.getDescription());
        movie.setReleaseYear(movieRequestDto.getReleaseYear());
        movie.setDuration(movieRequestDto.getDuration());
        movie.setVideoUrl(movieRequestDto.getVideoUrl());
        movie.setThumbnailUrl(movieRequestDto.getThumbnailUrl());
        movie.setPosterUrl(movieRequestDto.getPosterUrl());
        movie.setGenre(movieRequestDto.getGenre());
        movie.setImdbRating(
                movieRequestDto.getImdbRating() != null ? BigDecimal.valueOf(movieRequestDto.getImdbRating()) : null);

        Movie updatedMovie = movieRepository.save(movie);
        return convertToMovieResponseDto(updatedMovie);
    }

    @Override
    public void deleteMovie(Long id)throws NotFoundException {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found"));
        movieRepository.delete(movie);

    }

    @Override
    public MovieResponseDto getMovieById(Long id) throws NotFoundException {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found"));

        return convertToMovieResponseDto(movie);
    }

    @Override
    public Movie getMovieEntityById(Long id) throws NotFoundException {
        return movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found"));
    }

    @Override
    public List<MovieResponseDto> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        return movies.stream()
                .map(this::convertToMovieResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MovieResponseDto> getMoviesByGenre(String genre) {
        List<Movie> movies = movieRepository.findByGenre(genre);
        return movies.stream()
                .map(this::convertToMovieResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MovieResponseDto> searchMovies(String title, String genre, Integer year, String sortBy, String sortDir) {
        List<Movie> movies = movieRepository.findAll();

        // Filter by title
        if (title != null && !title.trim().isEmpty()) {
            movies = movies.stream()
                    .filter(movie -> movie.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Filter by genre
        if (genre != null && !genre.trim().isEmpty()) {
            movies = movies.stream()
                    .filter(movie -> movie.getGenre().toString().equalsIgnoreCase(genre))
                    .collect(Collectors.toList());
        }

        // Filter by year
        if (year != null) {
            movies = movies.stream()
                    .filter(movie -> movie.getReleaseYear().equals(year))
                    .collect(Collectors.toList());
        }

        // Sort
        Comparator<Movie> comparator = switch (sortBy.toLowerCase()) {
            case "title" -> Comparator.comparing(Movie::getTitle);
            case "year" -> Comparator.comparing(Movie::getReleaseYear);
            case "rating" -> Comparator.comparing(Movie::getImdbRating);
            case "views" -> Comparator.comparing(Movie::getViewCount);
            default -> Comparator.comparing(Movie::getTitle);
        };

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        movies = movies.stream().sorted(comparator).collect(Collectors.toList());

        return movies.stream()
                .map(this::convertToMovieResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MovieResponseDto> getRecommendationsForUser(User user) {
        // Simple recommendation logic - return featured and trending movies
        List<Movie> recommendedMovies = movieRepository.findAll().stream()
                .filter(movie -> movie.getFeatured() || movie.getTrending())
                .limit(10)
                .collect(Collectors.toList());

        return recommendedMovies.stream()
                .map(this::convertToMovieResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public MovieResponseDto toDto(Movie movie) {
        return convertToMovieResponseDto(movie);
    }

    private MovieResponseDto convertToMovieResponseDto(Movie movie) {
        MovieResponseDto dto = new MovieResponseDto();
        dto.setId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setDescription(movie.getDescription());
        dto.setReleaseYear(movie.getReleaseYear());
        dto.setDuration(formatDuration(movie.getDuration()));
        dto.setVideoUrl(movie.getVideoUrl());
        dto.setThumbnailUrl(movie.getThumbnailUrl());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setGenre(movie.getGenre() != null ? movie.getGenre().toString() : null);
        dto.setImdbRating(
                movie.getImdbRating() != null ? movie.getImdbRating().doubleValue() : null);
        dto.setCreatedAt(movie.getCreatedAt());
        dto.setUpdatedAt(movie.getUpdatedAt());
        dto.setViewCount(movie.getViewCount());
        dto.setFeatured(movie.getFeatured());
        dto.setTrending(movie.getTrending());
        return dto;
    }

    private String formatDuration(Duration duration) {
        if (duration == null) return null;
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
}
