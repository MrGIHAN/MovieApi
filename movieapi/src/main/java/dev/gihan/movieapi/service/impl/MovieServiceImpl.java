package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieServiceImpl implements MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public Movie createMovie(MovieRequestDto movieRequestDto) {

        Movie movie = new Movie();
        movie.setTitle(movieRequestDto.getTitle());
        movie.setDescription(movieRequestDto.getDescription());
        movie.setReleaseYear(movieRequestDto.getReleaseYear());
        movie.setDuration(movieRequestDto.getDuration());
        movie.setVideoUrl(movieRequestDto.getVideoUrl());
        movie.setThumbnailUrl(movieRequestDto.getThumbnailUrl());
        movie.setPosterUrl(movieRequestDto.getPosterUrl());
        movie.setGenre(movieRequestDto.getGenre());
        movie.setImdbRating(movieRequestDto.getImdbRating());

        return movieRepository.save(movie);

    }

    @Override
    public Movie updateMovie(Long id, MovieRequestDto movieRequestDto) throws NotFoundException {

        Movie movie = movieRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Movie not found"));

        movie.setTitle(movieRequestDto.getTitle());
        movie.setDescription(movieRequestDto.getDescription());
        movie.setReleaseYear(movieRequestDto.getReleaseYear());
        movie.setDuration(movieRequestDto.getDuration());
        movie.setVideoUrl(movieRequestDto.getVideoUrl());
        movie.setThumbnailUrl(movieRequestDto.getThumbnailUrl());
        movie.setPosterUrl(movieRequestDto.getPosterUrl());
        movie.setGenre(movieRequestDto.getGenre());
        movie.setImdbRating(movieRequestDto.getImdbRating());

        return movieRepository.save(movie);
    }

    @Override
    public void deleteMovie(Long id)throws NotFoundException {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found"));
        movieRepository.delete(movie);

    }

    @Override
    public Movie getMovieById(Long id) throws NotFoundException {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found"));

        return movie;
    }

    @Override
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Override
    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenre(genre);
    }
}
