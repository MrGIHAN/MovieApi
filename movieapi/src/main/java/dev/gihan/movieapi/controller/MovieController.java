package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.dto.responseDto.MessageResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    // ADMIN: Create movie
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<MessageResponseDto> createMovie(@RequestBody MovieRequestDto movieRequestDto) {
        movieService.createMovie(movieRequestDto);
        return ResponseEntity.ok(new MessageResponseDto("upload successful"));
    }

    // ADMIN: Update movie
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MessageResponseDto> updateMovie(@PathVariable Long id, @RequestBody MovieRequestDto movieRequestDto) throws NotFoundException {
        movieService.updateMovie(id, movieRequestDto);
        return ResponseEntity.ok(new MessageResponseDto("update is successful"));
    }

    // ADMIN: Delete movie
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteMovie(@PathVariable Long id) throws NotFoundException {
        movieService.deleteMovie(id);
    }

    // USER or ADMIN: Get movie by ID
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public Movie getMovieById(@PathVariable Long id) throws NotFoundException {
        return movieService.getMovieById(id);
    }

    // USER or ADMIN: List all movies
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // USER or ADMIN: List movies by genre
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/genre/{genre}")
    public List<Movie> getMoviesByGenre(@PathVariable String genre) {
        return movieService.getMoviesByGenre(genre);
    }
}
