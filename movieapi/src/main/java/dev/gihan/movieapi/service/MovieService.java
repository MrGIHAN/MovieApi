package dev.gihan.movieapi.service;


import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;

import java.util.List;

public interface MovieService {

    Movie createMovie(MovieRequestDto movieRequestDto);

    Movie updateMovie(Long id, MovieRequestDto movieRequestDto)throws NotFoundException;

    void deleteMovie(Long id) throws NotFoundException;

    Movie getMovieById(Long id) throws NotFoundException;

    List<Movie> getAllMovies();
    
    List<Movie> getMoviesByGenre(String genre);
}
