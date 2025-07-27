package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.responseDto.AdminStatsDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.Movie;

import java.util.List;

public interface AdminService {
    AdminStatsDto getAdminStatistics();
    List<UserResponseDto> getAllUsers();
    void deleteUser(Long userId);
    List<Movie> getTrendingMovies();
    void toggleFeaturedMovie(Long movieId);
    void moderateComment(Long commentId, boolean approve);
}