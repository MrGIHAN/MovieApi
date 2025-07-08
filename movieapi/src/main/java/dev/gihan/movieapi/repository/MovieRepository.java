package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Movie getMovieById(Long id);
    List<Movie> findByGenre(String genre);
}
