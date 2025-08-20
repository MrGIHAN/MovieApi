package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.responseDto.MovieResponseDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.WatchLater;
import dev.gihan.movieapi.repository.WatchLaterRepository;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.service.WatchLaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchLaterServiceImpl implements WatchLaterService {

    @Autowired
    private WatchLaterRepository watchLaterRepository;

    @Autowired
    private MovieService movieService;

    @Override
    public void addToWatchLater(User user, Movie movie) {
        Optional<WatchLater> existing = watchLaterRepository.findByUserAndMovie(user, movie);
        if (existing.isPresent()) return;

        WatchLater watchLater = new WatchLater();
        watchLater.setUser(user);
        watchLater.setMovie(movie);
        watchLaterRepository.save(watchLater);
    }

    @Override
    public void removeFromWatchLater(User user, Movie movie) {
        watchLaterRepository.deleteByUserAndMovie(user, movie);
    }

    @Override
    public List<MovieResponseDto> getWatchLater(User user) {
        return watchLaterRepository.findByUser(user)
                .stream()
                .map(WatchLater::getMovie)
                .map(movieService::toDto)
                .collect(Collectors.toList());
    }
}
