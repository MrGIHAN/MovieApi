package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.UpdateUserRequestDto;
import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.dto.responseDto.UserPreferencesDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.option.Role;
import dev.gihan.movieapi.repository.FavoriteRepository;
import dev.gihan.movieapi.repository.UserRepository;
import dev.gihan.movieapi.service.UserService;
import dev.gihan.movieapi.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(UserRequestDto userRequestDto) {
        if (userRequestDto == null || userRequestDto.getEmail() == null ||
                userRequestDto.getPassword() == null || userRequestDto.getFirstName() == null) {
            throw new RuntimeException("Missing required fields");
        }

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
        if (userRequestDto == null || userRequestDto.getEmail() == null ||
                userRequestDto.getPassword() == null || userRequestDto.getFirstName() == null) {
            throw new RuntimeException("Missing required fields");
        }

        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new RuntimeException("Admin already exists. Only one admin is allowed.");
        }

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
    public void deleteAdminIfExists() {
        userRepository.findByRole(Role.ADMIN).ifPresent(userRepository::delete);
    }

    @Override
    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public UserResponseDto updateProfile(String email, UpdateUserRequestDto request) throws NotFoundException {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new NotFoundException("User not found");
        }

        User user = optionalUser.get();

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid current password");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return convertToUserResponseDto(user);
    }

    private UserResponseDto convertToUserResponseDto(User user) {
        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId(user.getId().toString());
        responseDto.setEmail(user.getEmail());
        responseDto.setName(user.getFirstName() + " " + user.getLastName());
        responseDto.setAvatarUrl(null); // Optional

        List<Long> watchlistIds = user.getWatchLists().stream()
                .map(w -> w.getMovie().getId())
                .collect(Collectors.toList());
        responseDto.setWatchlist(watchlistIds);

        List<Long> historyIds = user.getWatchHistories().stream()
                .map(h -> h.getMovie().getId())
                .collect(Collectors.toList());
        responseDto.setHistory(historyIds);

        List<Long> favoriteIds = favoriteRepository.findByUser(user).stream()
                .map(f -> f.getMovie().getId())
                .collect(Collectors.toList());
        responseDto.setFavorites(favoriteIds);

        responseDto.setPreferences(new UserPreferencesDto());

        return responseDto;
    }
}
