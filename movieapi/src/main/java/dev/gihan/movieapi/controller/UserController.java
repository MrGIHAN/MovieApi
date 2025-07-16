package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.LoginRequestDto;
import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.service.WatchlistService;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.model.UserPreferences;
import dev.gihan.movieapi.service.UserPreferencesService;
import dev.gihan.movieapi.model.WatchHistory;
import dev.gihan.movieapi.service.WatchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserPreferencesService userPreferencesService;

    @Autowired
    private WatchHistoryService watchHistoryService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequestDto userRequestDto) {
        try {
            User user = userService.registerUser(userRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User registered successfully",
                    "userId", user.getId(),
                    "email", user.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody UserRequestDto userRequestDto) {
        try {
            User admin = userService.registerAdmin(userRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Admin registered successfully",
                    "userId", admin.getId(),
                    "email", admin.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginRequestDto) {
        try {
            UserResponseDto userResponse = userService.loginUser(
                    loginRequestDto.getEmail(),
                    loginRequestDto.getPassword()
            );
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "user", userResponse
            ));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // For Basic Auth, we can get current user info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                UserResponseDto userResponse = userService.getUserByEmail(email);
                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "User not authenticated"
                ));
            }
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponseDto userResponse = userService.getUserById(id);
            return ResponseEntity.ok(userResponse);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            UserResponseDto userResponse = userService.getUserByEmail(email);
            return ResponseEntity.ok(userResponse);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/admin-exists")
    public ResponseEntity<?> checkAdminExists() {
        boolean adminExists = userService.isAdminExists();
        return ResponseEntity.ok(Map.of(
                "adminExists", adminExists
        ));
    }

    // --- WATCHLIST ENDPOINTS ---
    @PostMapping("/watchlist/{movieId}")
    public ResponseEntity<?> addToWatchlist(@PathVariable Long movieId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Movie not found"));
        }
        watchlistService.addToWatchlist(user, movie);
        return ResponseEntity.ok(Map.of("message", "Movie added to watchlist"));
    }

    @DeleteMapping("/watchlist/{movieId}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Long movieId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Movie not found"));
        }
        watchlistService.removeFromWatchlist(user, movie);
        return ResponseEntity.ok(Map.of("message", "Movie removed from watchlist"));
    }

    @GetMapping("/watchlist")
    public ResponseEntity<?> getWatchlist() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(watchlistService.getWatchlist(user));
    }

    // --- USER PREFERENCES ENDPOINTS ---
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(userPreferencesService.getPreferences(user));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserPreferences preferences) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(userPreferencesService.updatePreferences(user, preferences));
    }

    // --- WATCH HISTORY ENDPOINTS ---
    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(watchHistoryService.getHistory(user));
    }

    @PostMapping("/history/{movieId}")
    public ResponseEntity<?> addOrUpdateHistory(
            @PathVariable Long movieId,
            @RequestBody Map<String, Object> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Movie not found"));
        }
        Integer position = (body.get("position") instanceof Integer) ? (Integer) body.get("position") : 0;
        Boolean completed = (body.get("completed") instanceof Boolean) ? (Boolean) body.get("completed") : false;
        watchHistoryService.addOrUpdateHistory(user, movie, position, completed);
        return ResponseEntity.ok(Map.of("message", "Watch history updated"));
    }
}