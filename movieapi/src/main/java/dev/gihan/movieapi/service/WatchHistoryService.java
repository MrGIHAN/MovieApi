package dev.gihan.movieapi.service;

import dev.gihan.movieapi.model.WatchHistory;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Movie;

import java.util.List;

public interface WatchHistoryService {
    void addOrUpdateHistory(User user, Movie movie, Integer position, Boolean completed);
    List<WatchHistory> getHistory(User user);
} 