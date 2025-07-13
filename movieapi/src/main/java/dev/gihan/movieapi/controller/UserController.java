package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.exception.NotFoundException;
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

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequestDto userRequestDto) {
        System.out.println("=== Register User Endpoint Hit ===");
        System.out.println("Email: " + userRequestDto.getEmail());
        try {
            User user = userService.registerUser(userRequestDto);
            System.out.println("User registered successfully: " + user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User registered successfully",
                    "userId", user.getId(),
                    "email", user.getEmail()
            ));
        } catch (RuntimeException e) {
            System.out.println("Error registering user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody UserRequestDto userRequestDto) {
        System.out.println("=== Register Admin Endpoint Hit ===");
        System.out.println("Email: " + userRequestDto.getEmail());
        System.out.println("First Name: " + userRequestDto.getFirstName());
        System.out.println("Last Name: " + userRequestDto.getLastName());

        try {
            User admin = userService.registerAdmin(userRequestDto);
            System.out.println("Admin registered successfully: " + admin.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Admin registered successfully",
                    "userId", admin.getId(),
                    "email", admin.getEmail()
            ));
        } catch (RuntimeException e) {
            System.out.println("Error registering admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

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
        System.out.println("=== Admin Exists Endpoint Hit ===");
        boolean adminExists = userService.isAdminExists();
        System.out.println("Admin exists: " + adminExists);
        return ResponseEntity.ok(Map.of(
                "adminExists", adminExists
        ));
    }
}