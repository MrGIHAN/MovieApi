package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

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
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            UserResponseDto userResponse = userService.loginUser(email, password);
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
}