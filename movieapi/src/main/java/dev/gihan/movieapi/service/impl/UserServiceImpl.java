package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.dto.responseDto.UserPreferencesDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.option.Role;
import dev.gihan.movieapi.repository.UserRepository;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(UserRequestDto userRequestDto) {
        // Validate input
        if (userRequestDto == null || userRequestDto.getEmail() == null ||
                userRequestDto.getPassword() == null || userRequestDto.getFirstName() == null) {
            throw new RuntimeException("Missing required fields");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(userRequestDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(userRequestDto.getEmail());
        user.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        user.setFirstName(userRequestDto.getFirstName());
        user.setLastName(userRequestDto.getLastName());
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    @Override
    public User registerAdmin(UserRequestDto userRequestDto) {
        // Validate input
        if (userRequestDto == null || userRequestDto.getEmail() == null ||
                userRequestDto.getPassword() == null || userRequestDto.getFirstName() == null) {
            throw new RuntimeException("Missing required fields");
        }

        // Check if admin already exists using the correct method
        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new RuntimeException("Admin already exists. Only one admin is allowed.");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(userRequestDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User admin = new User();
        admin.setEmail(userRequestDto.getEmail());
        admin.setPassword(passwordEncoder.encode(userRequestDto.getPassword()));
        admin.setFirstName(userRequestDto.getFirstName());
        admin.setLastName(userRequestDto.getLastName());
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());

        return userRepository.save(admin);
    }

    @Override
    public UserResponseDto loginUser(String email, String password) throws NotFoundException {
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new NotFoundException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new NotFoundException("Password is required");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new NotFoundException("User not found with email: " + email);
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new NotFoundException("Invalid password");
        }

        return convertToUserResponseDto(user);
    }

    @Override
    public UserResponseDto getUserById(Long id) throws NotFoundException {
        if (id == null) {
            throw new NotFoundException("User ID is required");
        }

        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty()) {
            throw new NotFoundException("User not found with id: " + id);
        }

        return convertToUserResponseDto(userOptional.get());
    }

    @Override
    public UserResponseDto getUserByEmail(String email) throws NotFoundException {
        if (email == null || email.trim().isEmpty()) {
            throw new NotFoundException("Email is required");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new NotFoundException("User not found with email: " + email);
        }

        return convertToUserResponseDto(userOptional.get());
    }

    @Override
    public boolean isAdminExists() {
        return userRepository.existsByRole(Role.ADMIN);
    }

    @Override
    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private UserResponseDto convertToUserResponseDto(User user) {
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId(user.getId().toString());
        responseDto.setEmail(user.getEmail());
        responseDto.setName(user.getFirstName() + " " + user.getLastName());
        responseDto.setAvatarUrl(null); // Can be implemented later

        // Initialize empty lists for watchlist and history
        responseDto.setWatchlist(new ArrayList<>());
        responseDto.setHistory(new ArrayList<>());

        // Set default preferences
        responseDto.setPreferences(new UserPreferencesDto());

        return responseDto;
    }
}