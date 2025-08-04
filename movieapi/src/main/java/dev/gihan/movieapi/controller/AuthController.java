package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.LoginRequestDto;
import dev.gihan.movieapi.dto.requestDto.RefreshTokenRequestDto;
import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.AuthResponseDto;
import dev.gihan.movieapi.dto.responseDto.MessageResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.AuthService;
import dev.gihan.movieapi.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        try {
            logger.info("Login attempt for email: {}", loginRequest.getEmail());
            AuthResponseDto authResponse = authService.login(loginRequest);
            logger.info("Successful login for email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            logger.warn("Failed login attempt for email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDto registerRequest) {
        try {
            logger.info("Registration attempt for email: {}", registerRequest.getEmail());
            User user = userService.registerUser(registerRequest);
            logger.info("Successful registration for email: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponseDto("User registered successfully"));
        } catch (RuntimeException e) {
            logger.warn("Failed registration attempt for email: {}", registerRequest.getEmail());
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody UserRequestDto registerRequest) {
        try {
            logger.info("Admin registration attempt for email: {}", registerRequest.getEmail());
            // Check if admin already exists
            if (userService.isAdminExists()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponseDto("Admin already exists. Only one admin is allowed."));
            }

            User admin = userService.registerAdmin(registerRequest);
            logger.info("Successful admin registration for email: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponseDto("Admin registered successfully"));
        } catch (RuntimeException e) {
            logger.warn("Failed admin registration attempt for email: {}", registerRequest.getEmail());
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    // Temporary endpoint for testing - create admin if none exists
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin() {
        try {
            if (userService.isAdminExists()) {
                return ResponseEntity.ok(new MessageResponseDto("Admin already exists"));
            }

            UserRequestDto adminRequest = new UserRequestDto();
            adminRequest.setEmail("admin@netflix.com");
            adminRequest.setPassword("admin123");
            adminRequest.setFirstName("Admin");
            adminRequest.setLastName("User");

            User admin = userService.registerAdmin(adminRequest);
            logger.info("Setup admin created: {}", admin.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponseDto("Admin created successfully with email: " + admin.getEmail()));
        } catch (RuntimeException e) {
            logger.error("Error setting up admin", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    // Development endpoint to create a test admin - Only available in development profile
    @Profile("!production")
    @PostMapping("/create-test-admin")
    public ResponseEntity<?> createTestAdmin() {
        try {
            logger.warn("Creating test admin - this endpoint should not be available in production!");
            // Delete existing admin if any
            userService.deleteAdminIfExists();
            
            UserRequestDto adminRequest = new UserRequestDto();
            adminRequest.setEmail("admin@test.com");
            adminRequest.setPassword("admin123");
            adminRequest.setFirstName("Test");
            adminRequest.setLastName("Admin");

            User admin = userService.registerAdmin(adminRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "message", "Test admin created successfully",
                        "email", admin.getEmail(),
                        "password", "admin123"
                    ));
        } catch (RuntimeException e) {
            logger.error("Error creating test admin", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    @GetMapping("/admin-exists")
    public ResponseEntity<?> checkAdminExists() {
        try {
            boolean adminExists = userService.isAdminExists();
            return ResponseEntity.ok(Map.of("adminExists", adminExists));
        } catch (Exception e) {
            logger.error("Error checking admin status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponseDto("Error checking admin status: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDto refreshRequest) {
        try {
            AuthResponseDto authResponse = authService.refreshToken(refreshRequest.getRefreshToken());
            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            logger.warn("Failed token refresh attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponseDto(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            logger.info("User logout: {}", auth.getName());
            authService.logout(auth.getName());
        }
        return ResponseEntity.ok(new MessageResponseDto("Logged out successfully"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
            boolean isValid = authService.validateToken(jwt);
            return ResponseEntity.ok().body(isValid);
        } catch (Exception e) {
            logger.warn("Token validation failed", e);
            return ResponseEntity.badRequest().body(false);
        }
    }
}