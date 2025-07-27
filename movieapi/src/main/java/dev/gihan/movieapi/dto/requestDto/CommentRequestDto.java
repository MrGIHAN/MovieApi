package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

@Data
public class CommentRequestDto {
    private String content;
    private Integer rating; // 1-5 stars (optional)
}