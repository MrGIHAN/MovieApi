package dev.gihan.movieapi.service;

import dev.gihan.movieapi.dto.responseDto.FileUploadResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    FileUploadResponseDto uploadVideo(MultipartFile file);
    FileUploadResponseDto uploadImage(MultipartFile file);
    void deleteFile(String fileName);
    boolean isValidVideoFile(MultipartFile file);
    boolean isValidImageFile(MultipartFile file);
}