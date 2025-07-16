package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.model.WatchHistory;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.repository.WatchHistoryRepository;
import dev.gihan.movieapi.service.WatchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchHistoryServiceImpl implements WatchHistoryService {

    @Autowired
    private WatchHistoryRepository historyRepository;

    @Override
    public void addOrUpdateHistory(User user, Movie movie, Integer position, Boolean completed) {
        WatchHistory history = historyRepository.findByUserAndMovie(user, movie)
                .orElse(new WatchHistory());
        history.setUser(user);
        history.setMovie(movie);
        history.setWatchPositionSeconds(position);
        history.setCompleted(completed);
        historyRepository.save(history);
    }

    @Override
    public List<WatchHistory> getHistory(User user) {
        return historyRepository.findByUser(user);
    }
} 