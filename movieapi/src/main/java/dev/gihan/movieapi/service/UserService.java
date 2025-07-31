package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.requestDto.UpdateUserRequestDto;
import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.User;

public interface UserService {
    User registerUser(UserRequestDto userRequestDto);
    User registerAdmin(UserRequestDto userRequestDto);
    UserResponseDto getUserById(Long id) throws NotFoundException;
    UserResponseDto getUserByEmail(String email) throws NotFoundException;
    User findByEmail(String email);
    UserResponseDto updateProfile(String email, UpdateUserRequestDto request) throws NotFoundException;
    boolean isAdminExists();
    void deleteAdminIfExists();
}