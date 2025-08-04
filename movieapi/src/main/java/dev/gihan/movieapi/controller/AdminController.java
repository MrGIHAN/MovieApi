package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.dto.responseDto.AdminStatsDto;
import dev.gihan.movieapi.dto.responseDto.FileUploadResponseDto;
import dev.gihan.movieapi.dto.responseDto.MessageResponseDto;
import dev.gihan.movieapi.dto.responseDto.MovieResponseDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.service.AdminService;
import dev.gihan.movieapi.service.FileUploadService;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private UserService userService;

    @Autowired
    private FileUploadService fileUploadService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getAdminStats() {
        AdminStatsDto stats = adminService.getAdminStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/movies")
    public ResponseEntity<?> createMovie(@RequestBody MovieRequestDto movieRequest) {
        try {
            MovieResponseDto movie = movieService.createMovie(movieRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(movie);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody MovieRequestDto movieRequest) {
        try {
            MovieResponseDto movie = movieService.updateMovie(id, movieRequest);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(new MessageResponseDto("Movie deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PostMapping("/upload/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            FileUploadResponseDto response = fileUploadService.uploadVideo(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PostMapping("/upload/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            FileUploadResponseDto response = fileUploadService.uploadImage(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(new MessageResponseDto("User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }

    @GetMapping("/movies/trending")
    public ResponseEntity<List<Movie>> getTrendingMovies() {
        List<Movie> trending = adminService.getTrendingMovies();
        return ResponseEntity.ok(trending);
    }

    @PostMapping("/movies/{movieId}/feature")
    public ResponseEntity<?> toggleFeatured(@PathVariable Long movieId) {
        try {
            adminService.toggleFeaturedMovie(movieId);
            return ResponseEntity.ok(new MessageResponseDto("Movie featured status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponseDto(e.getMessage()));
        }
    }
}
