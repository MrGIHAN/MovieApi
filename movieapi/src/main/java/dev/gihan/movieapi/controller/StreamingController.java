package dev.gihan.movieapi.controller;

import dev.gihan.movieapi.dto.requestDto.VideoProgressDto;
import dev.gihan.movieapi.exception.ResourceNotFoundException;
import dev.gihan.movieapi.model.Movie;
import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.service.MovieService;
import dev.gihan.movieapi.service.StreamingService;
import dev.gihan.movieapi.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/stream")
public class StreamingController {

    private static final Logger logger = LoggerFactory.getLogger(StreamingController.class);

    @Autowired
    private StreamingService streamingService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private UserService userService;

    @Value("${app.video.directory}")
    private String videoDirectory;

    @GetMapping("/{movieId}")
    public ResponseEntity<Resource> streamVideo(
            @PathVariable Long movieId,
            @RequestHeader(value = "Range", required = false) String rangeHeader,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            logger.info("Streaming request for movie ID: {}", movieId);

            Movie movie = movieService.getMovieEntityById(movieId);
            if (movie == null) {
                throw new ResourceNotFoundException("Movie", "id", movieId);
            }

            // Track streaming session
            String sessionId = UUID.randomUUID().toString();
            User user = getCurrentUser();
            streamingService.startStreamingSession(sessionId, user, movie, request);

            // Get video file path with security validation
            String videoPath = getSecureVideoFilePath(movie.getVideoUrl());
            File videoFile = new File(videoPath);

            if (!videoFile.exists() || !videoFile.isFile()) {
                logger.warn("Video file not found: {}", videoPath);
                throw new ResourceNotFoundException("Video file not found for movie: " + movie.getTitle());
            }

            // Security check: ensure file is within allowed directory
            if (!isPathSecure(videoFile.toPath(), Paths.get(videoDirectory))) {
                logger.error("Security violation: attempt to access file outside video directory: {}", videoPath);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            long fileSize = videoFile.length();
            Resource videoResource = new FileSystemResource(videoFile);
            String contentType = Files.probeContentType(videoFile.toPath());
            MediaType mediaType = contentType != null ?
                    MediaType.valueOf(contentType) : MediaType.APPLICATION_OCTET_STREAM;

            logger.info("Streaming video: {} (size: {} bytes)", movie.getTitle(), fileSize);

            // Handle range requests for video streaming
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return handleRangeRequest(videoResource, rangeHeader, fileSize, mediaType);
            }

            // Full file response
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .contentLength(fileSize)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(videoResource);

        } catch (ResourceNotFoundException e) {
            logger.warn("Resource not found for movie streaming: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during video streaming for movie ID: {}", movieId, e);
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
            logger.info("Progress updated for user: {} on movie: {}", user.getEmail(), progressDto.getMovieId());
            return ResponseEntity.ok().body("Progress updated successfully");

        } catch (Exception e) {
            logger.error("Error updating watch progress", e);
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
            logger.info("Movie marked as completed by user: {} for movie: {}", user.getEmail(), movieId);
            return ResponseEntity.ok().body("Movie marked as completed");

        } catch (Exception e) {
            logger.error("Error marking movie as completed", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private ResponseEntity<Resource> handleRangeRequest(Resource resource, String rangeHeader, long fileSize, MediaType mediaType) {
        try {
            String[] ranges = rangeHeader.substring(6).split("-");
            long start = Long.parseLong(ranges[0]);
            long end = ranges.length > 1 && !ranges[1].isEmpty() ?
                    Long.parseLong(ranges[1]) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
                logger.warn("Invalid range request: {}", rangeHeader);
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                        .build();
            }

            long contentLength = end - start + 1;

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(mediaType)
                    .contentLength(contentLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error handling range request", e);
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

    /**
     * FIXED: Get secure video file path with proper path construction and sanitization
     */
    private String getSecureVideoFilePath(String videoUrl) {
        logger.info("DEBUG - Original videoUrl from database: {}", videoUrl);
        logger.info("DEBUG - Configured videoDirectory: {}", videoDirectory);

        // Extract filename from URL path
        String fileName;
        if (videoUrl.startsWith("http")) {
            // If it's a full URL, extract filename
            fileName = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
        } else if (videoUrl.startsWith("/uploads/")) {
            // If it's a relative URL like "/uploads/videos/filename.mp4"
            fileName = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
        } else {
            // If it's already just a filename
            fileName = videoUrl;
        }

        logger.info("DEBUG - Extracted fileName: {}", fileName);

        // Sanitize filename to prevent path traversal but keep extension
        fileName = sanitizeFileName(fileName);

        logger.info("DEBUG - Sanitized fileName: {}", fileName);

        String finalPath = Paths.get(videoDirectory, fileName).toString();
        logger.info("DEBUG - Final video file path: {}", finalPath);

        return finalPath;
    }

    /**
     * FIXED: Sanitize filename while preserving file extension
     */
    private String sanitizeFileName(String fileName) {
        // Preserve file extension but prevent path traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            // If there are path traversal attempts, extract just the filename
            fileName = Paths.get(fileName).getFileName().toString();
        }

        // Remove any remaining dangerous characters but keep dots for extensions
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private boolean isPathSecure(Path filePath, Path allowedDirectory) {
        try {
            Path normalizedFile = filePath.normalize().toAbsolutePath();
            Path normalizedDir = allowedDirectory.normalize().toAbsolutePath();
            return normalizedFile.startsWith(normalizedDir);
        } catch (Exception e) {
            logger.error("Error validating path security", e);
            return false;
        }
    }
}