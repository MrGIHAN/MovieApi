package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.Comment;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByMovieOrderByCreatedAtDesc(Movie movie);
    List<Comment> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.movie.id = :movieId AND c.rating IS NOT NULL")
    Double getAverageRatingForMovie(@Param("movieId") Long movieId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.movie.id = :movieId")
    Long getCommentCountForMovie(@Param("movieId") Long movieId);
}