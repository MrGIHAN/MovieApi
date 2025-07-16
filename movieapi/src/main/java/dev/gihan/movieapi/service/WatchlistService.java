package dev.gihan.movieapi.service;

import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Watchlist;

import java.util.List;

public interface WatchlistService {

    void addToWatchlist(User user, Movie movie);
    void removeFromWatchlist(User user, Movie movie);
    List<Movie> getWatchlist(User user);

} 