package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.MovieRequestDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.option.Genre;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.repository.UserPreferencesRepository;
import dev.gihan.movieapi.repository.WatchHistoryRepository;
import dev.gihan.movieapi.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieServiceImpl implements MovieService {

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private UserPreferencesRepository preferencesRepository;

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

    @Override
    public List<Movie> searchMovies(String title, String genre, Integer year, String sortBy, String sortDir) {
        Genre genreEnum = null;
        if (genre != null) {
            try {
                genreEnum = Genre.valueOf(genre.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid genre
            }
        }

        List<Movie> filtered = movieRepository.searchAndFilter(title, genreEnum, year);

        Comparator<Movie> comparator = Comparator.comparing(Movie::getTitle); // default

        if ("releaseYear".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(Movie::getReleaseYear);
        } else if ("imdbRating".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(Movie::getImdbRating);
        }

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        return filtered.stream().sorted(comparator).collect(Collectors.toList());
    }



    @Override
    public List<Movie> getRecommendationsForUser(User user) {
        // Get watched movie IDs
        List<Long> watchedIds = watchHistoryRepository.findByUser(user).stream()
                .map(h -> h.getMovie().getId())
                .toList();

        // Get user's favorite genres
        List<String> preferredGenres = preferencesRepository.findByUser(user)
                .map(p -> p.getFavoriteGenres())
                .orElse(List.of());

        if (preferredGenres.isEmpty()) return List.of(); // no preferences yet

        // Fetch all movies matching favorite genres
        List<Movie> matched = movieRepository.findAll().stream()
                .filter(m -> m.getGenre() != null && preferredGenres.contains(m.getGenre().name()))
                .filter(m -> !watchedIds.contains(m.getId())) // exclude already watched
                .limit(20) // max 20 recommendations
                .collect(Collectors.toList());

        return matched;
    }


}
