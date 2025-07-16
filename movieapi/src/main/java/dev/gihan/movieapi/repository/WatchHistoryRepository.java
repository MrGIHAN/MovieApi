package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.WatchHistory;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {
    List<WatchHistory> findByUser(User user);
    Optional<WatchHistory> findByUserAndMovie(User user, Movie movie);
} 