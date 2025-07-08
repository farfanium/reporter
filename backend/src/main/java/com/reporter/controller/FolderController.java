package com.reporter.controller;

import com.reporter.dto.ApiResponse;
import com.reporter.dto.FolderItem;
import com.reporter.service.FolderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Slf4j
public class FolderController {

    private final FolderService folderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderItem>>> getFolders(
            @RequestParam(value = "path", defaultValue = "/") String path) {
        try {
            log.debug("Getting folders for path: {}", path);
            List<FolderItem> folders = folderService.getFolders(path);
            return ResponseEntity.ok(ApiResponse.success(folders));
        } catch (Exception e) {
            log.error("Error getting folders for path: {}", path, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to browse folders: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validatePath(@RequestParam String path) {
        try {
            log.debug("Validating path: {}", path);
            boolean isValid = folderService.isValidPath(path);
            return ResponseEntity.ok(ApiResponse.success(isValid));
        } catch (Exception e) {
            log.error("Error validating path: {}", path, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to validate path: " + e.getMessage()));
        }
    }
}
