package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieStatsDto {
    private Long totalViews;
    private Double averageRating;
    private Long totalComments;
    private Long totalFavorites;
    private Long totalWatchLater;
}