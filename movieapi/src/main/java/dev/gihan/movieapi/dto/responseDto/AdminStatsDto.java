package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsDto {
    private Long totalUsers;
    private Long totalMovies;
    private Long totalViews;
    private Long totalComments;
    private Map<String, Long> genreDistribution;
    private Map<String, Long> monthlySignups;
    private Map<String, Long> popularMovies;
}
