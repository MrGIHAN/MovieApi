package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.model.Favorite;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.FavoriteRepository;
import dev.gihan.movieapi.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Override
    public void addToFavorites(User user, Movie movie) {
        if (user.isAdmin()) return;

        Optional<Favorite> existing = favoriteRepository.findByUserAndMovie(user, movie);
        if (existing.isPresent()) return;

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setMovie(movie);
        favoriteRepository.save(favorite);
    }

    @Override
    public void removeFromFavorites(User user, Movie movie) {
        favoriteRepository.deleteByUserAndMovie(user, movie);
    }

    @Override
    public List<Movie> getFavorites(User user) {
        return favoriteRepository.findByUser(user).stream()
                .map(Favorite::getMovie)
                .collect(Collectors.toList());
    }
}
