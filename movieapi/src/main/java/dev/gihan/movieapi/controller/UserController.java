package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.LoginRequestDto;
import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.UserPreferences;
import dev.gihan.movieapi.model.WatchHistory;
import dev.gihan.movieapi.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MovieService movieService;
    private final WatchlistService watchlistService;
    private final WatchLaterService watchLaterService;
    private final FavoriteService favoriteService;
    private final WatchHistoryService watchHistoryService;
    private final UserPreferencesService preferencesService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequestDto dto) {
        try {
            User user = userService.registerUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered", "email", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody UserRequestDto dto) {
        try {
            User user = userService.registerAdmin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Admin registered", "email", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

//   @PostMapping("/login")
//   public ResponseEntity<?> login(@RequestBody LoginRequestDto dto) {
//       try {
//           UserResponseDto user = userService.loginUser(dto.getEmail(), dto.getPassword());
//           return ResponseEntity.ok(user);
//       } catch (NotFoundException e) {
//           return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
//       }
//   }

    @GetMapping("/me")
    public ResponseEntity<?> getLoggedInUser() {
        String email = getCurrentUserEmail();
        if (email == null) return unauthorized();
        try {
            return ResponseEntity.ok(userService.getUserByEmail(email));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin-exists")
    public ResponseEntity<?> adminExists() {
        return ResponseEntity.ok(Map.of("adminExists", userService.isAdminExists()));
    }

    @PostMapping("/watchlist/{movieId}")
    public ResponseEntity<?> addToWatchlist(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            watchlistService.addToWatchlist(user, movie);
            return ResponseEntity.ok(Map.of("message", "Added to watchlist"));
        }, movieId);
    }

    @DeleteMapping("/watchlist/{movieId}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            watchlistService.removeFromWatchlist(user, movie);
            return ResponseEntity.ok(Map.of("message", "Removed from watchlist"));
        }, movieId);
    }

    @GetMapping("/watchlist")
    public ResponseEntity<?> getWatchlist() {
        return secureUserAction(user -> ResponseEntity.ok(watchlistService.getWatchlist(user)));
    }

    @PostMapping("/favorites/{movieId}")
    public ResponseEntity<?> addToFavorites(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            favoriteService.addToFavorites(user, movie);
            return ResponseEntity.ok(Map.of("message", "Added to favorites"));
        }, movieId);
    }

    @DeleteMapping("/favorites/{movieId}")
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            favoriteService.removeFromFavorites(user, movie);
            return ResponseEntity.ok(Map.of("message", "Removed from favorites"));
        }, movieId);
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites() {
        return secureUserAction(user -> ResponseEntity.ok(favoriteService.getFavorites(user)));
    }

    @PostMapping("/watchlater/{movieId}")
    public ResponseEntity<?> addToWatchLater(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            watchLaterService.addToWatchLater(user, movie);
            return ResponseEntity.ok(Map.of("message", "Added to watch later"));
        }, movieId);
    }

    @DeleteMapping("/watchlater/{movieId}")
    public ResponseEntity<?> removeFromWatchLater(@PathVariable Long movieId) throws NotFoundException {
        return secureAction((user, movie) -> {
            watchLaterService.removeFromWatchLater(user, movie);
            return ResponseEntity.ok(Map.of("message", "Removed from watch later"));
        }, movieId);
    }

    @GetMapping("/watchlater")
    public ResponseEntity<?> getWatchLater() {
        return secureUserAction(user -> ResponseEntity.ok(watchLaterService.getWatchLater(user)));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getWatchHistory() {
        return secureUserAction(user -> ResponseEntity.ok(watchHistoryService.getHistory(user)));
    }

    @PostMapping("/history/{movieId}")
    public ResponseEntity<?> updateWatchHistory(@PathVariable Long movieId, @RequestBody Map<String, Object> body) throws NotFoundException {
        return secureAction((user, movie) -> {
            Integer pos = (Integer) body.getOrDefault("position", 0);
            Boolean completed = (Boolean) body.getOrDefault("completed", false);
            watchHistoryService.addOrUpdateHistory(user, movie, pos, completed);
            return ResponseEntity.ok(Map.of("message", "Watch history updated"));
        }, movieId);
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        return secureUserAction(user -> ResponseEntity.ok(preferencesService.getPreferences(user)));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserPreferences preferences) {
        return secureUserAction(user -> ResponseEntity.ok(preferencesService.updatePreferences(user, preferences)));
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
    }

    private ResponseEntity<?> secureUserAction(java.util.function.Function<User, ResponseEntity<?>> action) {
        String email = getCurrentUserEmail();
        if (email == null) return unauthorized();
        User user = userService.findByEmail(email);
        return action.apply(user);
    }

    private ResponseEntity<?> secureAction(java.util.function.BiFunction<User, Movie, ResponseEntity<?>> action, Long movieId) throws NotFoundException {
        String email = getCurrentUserEmail();
        if (email == null) return unauthorized();
        User user = userService.findByEmail(email);
        Movie movie = movieService.getMovieEntityById(movieId);
        if (movie == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Movie not found"));
        return action.apply(user, movie);
    }
}
