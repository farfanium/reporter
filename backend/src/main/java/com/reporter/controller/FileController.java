package com.reporter.controller;

import com.reporter.model.FileData;
import com.reporter.dto.ApiResponse;
import com.reporter.service.FileParsingService;
import com.reporter.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileParsingService fileParsingService;
    private final ReportService reportService;

    @GetMapping("/{reportId}/{fileName}")
    public ResponseEntity<ApiResponse<FileData>> getFileData(@PathVariable String reportId, 
                                                           @PathVariable String fileName) {
        try {
            // First, verify the report exists and get its path
            var report = reportService.getReportById(reportId);
            
            // Parse the file data
            FileData fileData = fileParsingService.parseFile(report.getPath(), fileName);
            
            return ResponseEntity.ok(ApiResponse.success(fileData));
        } catch (Exception e) {
            log.error("Error parsing file: {} for report: {}", fileName, reportId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error parsing file: " + e.getMessage()));
        }
    }
}
