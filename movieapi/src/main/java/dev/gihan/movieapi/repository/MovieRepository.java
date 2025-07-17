package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.option.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Movie getMovieById(Long id);
    List<Movie> findByGenre(String genre);



    @Query("SELECT m FROM Movie m WHERE " +
            "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:genre IS NULL OR m.genre = :genre) AND " +
            "(:year IS NULL OR m.releaseYear = :year)")
    List<Movie> searchAndFilter(
            @Param("title") String title,
            @Param("genre") Genre genre,
            @Param("year") Integer year
    );

}
