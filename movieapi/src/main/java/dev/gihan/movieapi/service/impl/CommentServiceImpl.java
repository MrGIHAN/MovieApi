package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.requestDto.CommentRequestDto;
import dev.gihan.movieapi.dto.responseDto.CommentResponseDto;
import dev.gihan.movieapi.exception.NotFoundException;
import dev.gihan.movieapi.model.Comment;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.repository.CommentRepository;
import dev.gihan.movieapi.repository.MovieRepository;
import dev.gihan.movieapi.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public List<CommentResponseDto> getCommentsByMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        List<Comment> comments = commentRepository.findByMovieOrderByCreatedAtDesc(movie);
        return comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponseDto addComment(User user, Long movieId, CommentRequestDto commentRequest) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setMovie(movie);
        comment.setContent(commentRequest.getContent());
        comment.setRating(commentRequest.getRating());

        Comment savedComment = commentRepository.save(comment);
        return convertToDto(savedComment);
    }

    @Override
    public CommentResponseDto updateComment(User user, Long commentId, CommentRequestDto commentRequest) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(commentRequest.getContent());
        comment.setRating(commentRequest.getRating());

        Comment updatedComment = commentRepository.save(comment);
        return convertToDto(updatedComment);
    }

    @Override
    public void deleteComment(User user, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId()) && !user.isAdmin()) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    @Override
    public Double getAverageRating(Long movieId) {
        return commentRepository.getAverageRatingForMovie(movieId);
    }

    private CommentResponseDto convertToDto(Comment comment) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setRating(comment.getRating());
        dto.setUserName(comment.getUser().getFirstName() + " " + comment.getUser().getLastName());
        dto.setUserEmail(comment.getUser().getEmail());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}