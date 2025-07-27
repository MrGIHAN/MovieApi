package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.VideoProgressDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.StreamingSession;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.repository.StreamingSessionRepository;
import dev.gihan.movieapi.service.StreamingService;
import dev.gihan.movieapi.service.WatchHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class StreamingServiceImpl implements StreamingService {

    @Autowired
    private StreamingSessionRepository sessionRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private WatchHistoryService watchHistoryService;

    @Override
    public StreamingSession startStreamingSession(String sessionId, User user, Movie movie, HttpServletRequest request) {
        StreamingSession session = new StreamingSession();
        session.setSessionId(sessionId);
        session.setUser(user);
        session.setMovie(movie);
        session.setIpAddress(getClientIpAddress(request));
        session.setUserAgent(request.getHeader("User-Agent"));
        session.setStartTime(LocalDateTime.now());

        // Increment view count
        movie.setViewCount(movie.getViewCount() + 1);
        movieRepository.save(movie);

        return sessionRepository.save(session);
    }

    @Override
    public void endStreamingSession(String sessionId, Integer durationWatched) {
        StreamingSession session = sessionRepository.findBySessionId(sessionId);
        if (session != null) {
            session.setEndTime(LocalDateTime.now());
            session.setDurationWatched(durationWatched);

            // Mark as completed if watched > 90% of the movie
            if (durationWatched != null && session.getMovie().getDuration() != null) {
                long movieDurationSeconds = session.getMovie().getDuration().getSeconds();
                if (durationWatched >= movieDurationSeconds * 0.9) {
                    session.setCompleted(true);
                }
            }

            sessionRepository.save(session);
        }
    }

    @Override
    public void updateWatchProgress(User user, VideoProgressDto progressDto) {
        try {
            Movie movie = movieRepository.findById(progressDto.getMovieId())
                    .orElseThrow(() -> new NotFoundException("Movie not found"));

            watchHistoryService.addOrUpdateHistory(
                    user,
                    movie,
                    progressDto.getCurrentPosition(),
                    progressDto.getCompleted()
            );
        } catch (NotFoundException e) {
            throw new RuntimeException("Movie not found");
        }
    }

    @Override
    public void markAsCompleted(User user, Long movieId) {
        try {
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new NotFoundException("Movie not found"));

            watchHistoryService.addOrUpdateHistory(user, movie, null, true);
        } catch (NotFoundException e) {
            throw new RuntimeException("Movie not found");
        }
    }

    @Override
    public List<StreamingSession> getActiveStreams() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return sessionRepository.findActiveStreams(oneHourAgo);
    }

    @Override
    public Long getTotalViewsForMovie(Long movieId) {
        return sessionRepository.countByMovieId(movieId);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}