package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.Watchlist;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUser(User user);
    Optional<Watchlist> findByUserAndMovie(User user, Movie movie);
    void deleteByUserAndMovie(User user, Movie movie);

} 