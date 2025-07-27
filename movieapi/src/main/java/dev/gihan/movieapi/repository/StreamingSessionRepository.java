package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.StreamingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StreamingSessionRepository extends JpaRepository<StreamingSession, Long> {
    StreamingSession findBySessionId(String sessionId);

    @Query("SELECT s FROM StreamingSession s WHERE s.startTime >= :since AND s.endTime IS NULL")
    List<StreamingSession> findActiveStreams(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM StreamingSession s WHERE s.movie.id = :movieId")
    Long countByMovieId(@Param("movieId") Long movieId);

    @Query("SELECT s FROM StreamingSession s WHERE s.user.id = :userId ORDER BY s.startTime DESC")
    List<StreamingSession> findByUserIdOrderByStartTimeDesc(@Param("userId") Long userId);
}