package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.service.FileUploadService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

class FileUploadServiceImplTest {

    private final FileUploadService fileUploadService = new FileUploadServiceImpl();

    @Test
    void acceptsQuicktimeVideo() {
        MockMultipartFile file = new MockMultipartFile("file", "sample.mov", "video/quicktime", new byte[10]);
        assertTrue(fileUploadService.isValidVideoFile(file));
    }

    @Test
    void rejectsUnsupportedVideoType() {
        MockMultipartFile file = new MockMultipartFile("file", "sample.xyz", "video/xyz", new byte[10]);
        assertFalse(fileUploadService.isValidVideoFile(file));
    }
}

