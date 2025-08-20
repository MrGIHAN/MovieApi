package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.responseDto.MovieResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.service.WatchLaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watch-later")
public class WatchLaterController {

    @Autowired private WatchLaterService watchLaterService;
    @Autowired private MovieRepository movieRepository;
    @Autowired private UserService userService;

    @GetMapping
    public ResponseEntity<List<MovieResponseDto>> getWatchLater() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(watchLaterService.getWatchLater(user));
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<Void> addToWatchLater(@PathVariable Long movieId) throws NotFoundException {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found"));

        watchLaterService.addToWatchLater(user, movie);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> removeFromWatchLater(@PathVariable Long movieId) throws NotFoundException {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found"));

        watchLaterService.removeFromWatchLater(user, movie);
        return ResponseEntity.noContent().build();
    }

    // ---------- helpers ----------
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof User) return (User) principal;

        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userService.findByEmail(email);            // returns User (not Optional)
            // If your method returns Optional<User>, use: return userService.findByEmail(email).orElse(null);
        }

        if (principal instanceof String) {
            String email = (String) principal;
            if ("anonymousUser".equalsIgnoreCase(email)) return null;
            return userService.findByEmail(email);            // same note as above
        }
        return null;
    }
}
