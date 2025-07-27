package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.VideoProgressDto;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.service.StreamingService;
import dev.gihan.movieapi.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/stream")
public class StreamingController {

    @Autowired
    private StreamingService streamingService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private UserService userService;

    private static final String VIDEO_DIRECTORY = "src/main/resources/static/videos/";

    @GetMapping("/{movieId}")
    public ResponseEntity<Resource> streamVideo(
            @PathVariable Long movieId,
            @RequestHeader(value = "Range", required = false) String rangeHeader,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            Movie movie = movieService.getMovieById(movieId);

            // Track streaming session
            String sessionId = UUID.randomUUID().toString();
            User user = getCurrentUser();
            streamingService.startStreamingSession(sessionId, user, movie, request);

            // Get video file path
            String videoPath = getVideoFilePath(movie.getVideoUrl());
            File videoFile = new File(videoPath);

            if (!videoFile.exists()) {
                return ResponseEntity.notFound().build();
            }

            long fileSize = videoFile.length();
            Resource videoResource = new FileSystemResource(videoFile);

            // Handle range requests for video streaming
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return handleRangeRequest(videoResource, rangeHeader, fileSize);
            }

            // Full file response
            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("video/mp4"))
                    .contentLength(fileSize)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(videoResource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/progress")
    public ResponseEntity<?> updateProgress(@RequestBody VideoProgressDto progressDto) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User must be logged in to save progress");
            }

            streamingService.updateWatchProgress(user, progressDto);
            return ResponseEntity.ok().body("Progress updated successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/complete/{movieId}")
    public ResponseEntity<?> markAsCompleted(@PathVariable Long movieId) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User must be logged in");
            }

            streamingService.markAsCompleted(user, movieId);
            return ResponseEntity.ok().body("Movie marked as completed");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private ResponseEntity<Resource> handleRangeRequest(Resource resource, String rangeHeader, long fileSize) {
        try {
            String[] ranges = rangeHeader.substring(6).split("-");
            long start = Long.parseLong(ranges[0]);
            long end = ranges.length > 1 && !ranges[1].isEmpty() ?
                    Long.parseLong(ranges[1]) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                        .build();
            }

            long contentLength = end - start + 1;

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.valueOf("video/mp4"))
                    .contentLength(contentLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userService.findByEmail(auth.getName());
    }

    private String getVideoFilePath(String videoUrl) {
        // Extract filename from URL and construct local path
        if (videoUrl.startsWith("http")) {
            // If it's a URL, extract filename
            String fileName = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
            return VIDEO_DIRECTORY + fileName;
        }
        // If it's already a local path
        return VIDEO_DIRECTORY + videoUrl;
    }
}
