package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.dto.responseDto.MessageResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ✅ Anyone can see all movies - NO AUTH REQUIRED
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // ✅ Anyone can see a single movie by ID - NO AUTH REQUIRED
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(movieService.getMovieById(id));
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Anyone can see movies by genre - NO AUTH REQUIRED
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Movie>> getMoviesByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(movieService.getMoviesByGenre(genre));
    }

    // 🔒 Only ADMIN can create movies
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> createMovie(@RequestBody MovieRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.createMovie(request));
    }

    // 🔒 Only ADMIN can update movies
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieRequestDto request) {
        try {
            return ResponseEntity.ok(movieService.updateMovie(id, request));
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔒 Only ADMIN can delete movies
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponseDto> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(new MessageResponseDto("Movie deleted successfully"));
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}