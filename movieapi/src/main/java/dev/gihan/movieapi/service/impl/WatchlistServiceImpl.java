package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Watchlist;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.repository.UserRepository;
import dev.gihan.movieapi.repository.WatchlistRepository;
import dev.gihan.movieapi.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchlistServiceImpl implements WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public void addToWatchlist(User user, Movie movie) {
        Optional<Watchlist> existing = watchlistRepository.findByUserAndMovie(user, movie);
        if (existing.isPresent()) {
            return; // Already in watchlist
        }
        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setMovie(movie);
        watchlist.setAddedAt(LocalDateTime.now());
        watchlistRepository.save(watchlist);
    }

    @Override
    public void removeFromWatchlist(User user, Movie movie) {
        watchlistRepository.deleteByUserAndMovie(user, movie);
    }

    @Override
    public List<Movie> getWatchlist(User user) {
        List<Watchlist> watchlists = watchlistRepository.findByUser(user);
        return watchlists.stream().map(Watchlist::getMovie).collect(Collectors.toList());
    }
} 