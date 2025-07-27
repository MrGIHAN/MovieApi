package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.responseDto.AdminStatsDto;
import dev.gihan.movieapi.dto.responseDto.UserResponseDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.*;
import dev.gihan.movieapi.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private StreamingSessionRepository sessionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Override
    public AdminStatsDto getAdminStatistics() {
        AdminStatsDto stats = new AdminStatsDto();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalMovies(movieRepository.count());
        stats.setTotalViews(sessionRepository.count());
        stats.setTotalComments(commentRepository.count());

        // Genre distribution
        Map<String, Long> genreDistribution = new HashMap<>();
        List<Movie> allMovies = movieRepository.findAll();
        allMovies.forEach(movie -> {
            if (movie.getGenre() != null) {
                String genre = movie.getGenre().name();
                genreDistribution.put(genre, genreDistribution.getOrDefault(genre, 0L) + 1);
            }
        });
        stats.setGenreDistribution(genreDistribution);

        // Monthly signups (last 12 months)
        Map<String, Long> monthlySignups = new HashMap<>();
        LocalDateTime twelveMonthsAgo = LocalDateTime.now().minusMonths(12);
        List<User> recentUsers = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt().isAfter(twelveMonthsAgo))
                .collect(Collectors.toList());

        recentUsers.forEach(user -> {
            String month = user.getCreatedAt().getMonth().name() + " " + user.getCreatedAt().getYear();
            monthlySignups.put(month, monthlySignups.getOrDefault(month, 0L) + 1);
        });
        stats.setMonthlySignups(monthlySignups);

        // Popular movies (top 10 by view count)
        Map<String, Long> popularMovies = new HashMap<>();
        allMovies.stream()
                .sorted((m1, m2) -> Long.compare(m2.getViewCount(), m1.getViewCount()))
                .limit(10)
                .forEach(movie -> popularMovies.put(movie.getTitle(), movie.getViewCount()));
        stats.setPopularMovies(popularMovies);

        return stats;
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isAdmin()) {
            throw new RuntimeException("Cannot delete admin user");
        }

        userRepository.delete(user);
    }

    @Override
    public List<Movie> getTrendingMovies() {
        // Get movies with high view count in the last 7 days
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return movieRepository.findAll().stream()
                .sorted((m1, m2) -> Long.compare(m2.getViewCount(), m1.getViewCount()))
                .limit(20)
                .collect(Collectors.toList());
    }

    @Override
    public void toggleFeaturedMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        movie.setFeatured(!movie.getFeatured());
        movieRepository.save(movie);
    }

    @Override
    public void moderateComment(Long commentId, boolean approve) {
        // Implementation for comment moderation
        // This could involve setting a status field on comments
    }

    private UserResponseDto convertToUserResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId().toString());
        dto.setEmail(user.getEmail());
        dto.setName(user.getFirstName() + " " + user.getLastName());

        // Get user's favorites, watchlist, and history
        List<Long> favoriteIds = favoriteRepository.findByUser(user).stream()
                .map(f -> f.getMovie().getId())
                .collect(Collectors.toList());
        dto.setFavorites(favoriteIds);

        // Add other fields as needed
        return dto;
    }
}
