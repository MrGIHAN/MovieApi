package dev.gihan.movieapi.dto.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponseDto {
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String message;
}