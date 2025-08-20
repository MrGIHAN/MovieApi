package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.Favorite;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = "movie")
    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndMovie(User user, Movie movie);

    void deleteByUserAndMovie(User user, Movie movie);
}
