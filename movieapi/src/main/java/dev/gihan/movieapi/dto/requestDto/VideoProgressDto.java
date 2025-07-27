package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

@Data
public class VideoProgressDto {
    private Long movieId;
    private Integer currentPosition; // seconds
    private Integer totalDuration;   // seconds
    private Boolean completed;
}