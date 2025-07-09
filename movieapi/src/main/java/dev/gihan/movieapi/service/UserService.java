package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.requestDto.UserRequestDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.exception.NotFoundException;

public interface UserService {

    User registerUser(UserRequestDto userRequestDto);

    User registerAdmin(UserRequestDto userRequestDto);

    UserResponseDto loginUser(String email, String password) throws NotFoundException;

    UserResponseDto getUserById(Long id) throws NotFoundException;

    UserResponseDto getUserByEmail(String email) throws NotFoundException;

    boolean isAdminExists();

    User findByEmail(String email);
}