package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.responseDto.MessageResponseDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.service.WatchLaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watch-later")
@CrossOrigin(origins = "http://localhost:3000")
public class WatchLaterController {

    @Autowired
    private WatchLaterService watchLaterService;

    @Autowired
    private UserService userService;

    @Autowired
    private MovieService movieService;

    @GetMapping
    public ResponseEntity<?> getWatchLater() {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            List<Movie> watchLater = watchLaterService.getWatchLater(user);
            return ResponseEntity.ok(watchLater);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addToWatchLater(@PathVariable Long movieId) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            Movie movie = movieService.getMovieById(movieId);
            watchLaterService.addToWatchLater(user, movie);
            return ResponseEntity.ok(new MessageResponseDto("Movie added to watch later"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<?> removeFromWatchLater(@PathVariable Long movieId) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            Movie movie = movieService.getMovieById(movieId);
            watchLaterService.removeFromWatchLater(user, movie);
            return ResponseEntity.ok(new MessageResponseDto("Movie removed from watch later"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userService.findByEmail(auth.getName());
    }
}
