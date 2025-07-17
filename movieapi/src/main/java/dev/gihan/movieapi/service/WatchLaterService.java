package dev.gihan.movieapi.service;

import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;

import java.util.List;

public interface WatchLaterService {

    void addToWatchLater(User user, Movie movie);
    void removeFromWatchLater(User user, Movie movie);
    List<Movie> getWatchLater(User user);

}
