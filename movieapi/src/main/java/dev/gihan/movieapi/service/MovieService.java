package dev.gihan.movieapi.service;


import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.dto.responseDto.MovieResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;

import java.util.List;

public interface MovieService {

    MovieResponseDto createMovie(MovieRequestDto movieRequestDto);

    MovieResponseDto updateMovie(Long id, MovieRequestDto movieRequestDto)throws NotFoundException;

    void deleteMovie(Long id) throws NotFoundException;

    MovieResponseDto getMovieById(Long id) throws NotFoundException;

    Movie getMovieEntityById(Long id) throws NotFoundException;

    List<MovieResponseDto> getAllMovies();
    
    List<MovieResponseDto> getMoviesByGenre(String genre);

    List<MovieResponseDto> searchMovies(String title, String genre, Integer year, String sortBy, String sortDir);

    List<MovieResponseDto> getRecommendationsForUser(User user);

    MovieResponseDto toDto(Movie movie);


}
