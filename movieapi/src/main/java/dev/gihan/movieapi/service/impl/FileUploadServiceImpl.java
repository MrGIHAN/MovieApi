package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.dto.responseDto.FileUploadResponseDto;
import dev.gihan.movieapi.service.FileUploadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadServiceImpl implements FileUploadService {

    @Value("${app.file.upload.dir:src/main/resources/static/uploads}")
    private String uploadDir;

    @Value("${app.file.max-size:100MB}")
    private String maxFileSize;

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/avi", "video/quicktime", "video/wmv", "video/flv", "video/webm"
    );

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    @Override
    public FileUploadResponseDto uploadVideo(MultipartFile file) {
        if (!isValidVideoFile(file)) {
            throw new RuntimeException("Invalid video file type");
        }

        return uploadFile(file, "videos");
    }

    @Override
    public FileUploadResponseDto uploadImage(MultipartFile file) {
        if (!isValidImageFile(file)) {
            throw new RuntimeException("Invalid image file type");
        }

        return uploadFile(file, "images");
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + fileName, e);
        }
    }

    @Override
    public boolean isValidVideoFile(MultipartFile file) {
        return file != null && !file.isEmpty() &&
                ALLOWED_VIDEO_TYPES.contains(file.getContentType());
    }

    @Override
    public boolean isValidImageFile(MultipartFile file) {
        return file != null && !file.isEmpty() &&
                ALLOWED_IMAGE_TYPES.contains(file.getContentType());
    }

    private FileUploadResponseDto uploadFile(MultipartFile file, String subDirectory) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, subDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate file URL
            String fileUrl = "/uploads/" + subDirectory + "/" + uniqueFilename;

            return new FileUploadResponseDto(
                    uniqueFilename,
                    fileUrl,
                    file.getContentType(),
                    file.getSize(),
                    "File uploaded successfully"
            );

        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }
}