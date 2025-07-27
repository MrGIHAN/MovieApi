package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.requestDto.VideoProgressDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.StreamingSession;
import dev.gihan.movieapi.model.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface StreamingService {
    StreamingSession startStreamingSession(String sessionId, User user, Movie movie, HttpServletRequest request);
    void endStreamingSession(String sessionId, Integer durationWatched);
    void updateWatchProgress(User user, VideoProgressDto progressDto);
    void markAsCompleted(User user, Long movieId);
    List<StreamingSession> getActiveStreams();
    Long getTotalViewsForMovie(Long movieId);
}