package dev.gihan.movieapi.service;

import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;

import java.util.List;

public interface FavoriteService {
    void addToFavorites(User user, Movie movie);
    void removeFromFavorites(User user, Movie movie);
    List<Movie> getFavorites(User user);
}
