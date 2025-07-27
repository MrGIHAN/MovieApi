package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.requestDto.CommentRequestDto;
import dev.gihan.movieapi.dto.responseDto.CommentResponseDto;
import dev.gihan.movieapi.model.User;

import java.util.List;

public interface CommentService {
    List<CommentResponseDto> getCommentsByMovie(Long movieId);
    CommentResponseDto addComment(User user, Long movieId, CommentRequestDto commentRequest);
    CommentResponseDto updateComment(User user, Long commentId, CommentRequestDto commentRequest);
    void deleteComment(User user, Long commentId);
    Double getAverageRating(Long movieId);
}