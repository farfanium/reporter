package com.reporter.controller;

import com.reporter.model.Report;
import com.reporter.dto.CreateReportRequest;
import com.reporter.dto.ApiResponse;
import com.reporter.service.ReportService;
import com.reporter.exception.DuplicateReportPathException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        try {
            List<Report> reports = reportService.getAllReports();
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            log.error("Error retrieving reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving reports: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReportById(@PathVariable String id) {
        try {
            Report report = reportService.getReportById(id);
            return ResponseEntity.ok(ApiResponse.success(report));
        } catch (Exception e) {
            log.error("Error retrieving report: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Report not found: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Report>> createReport(@Valid @RequestBody CreateReportRequest request) {
        try {
            Report report = reportService.createReport(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(report));
        } catch (DuplicateReportPathException e) {
            log.warn("Duplicate report path: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Report already exists: " + e.getExistingReportName() + " uses path '" + e.getDuplicatePath() + "'"));
        } catch (Exception e) {
            log.error("Error creating report", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error creating report: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> updateReport(@PathVariable String id, 
                                                           @Valid @RequestBody CreateReportRequest request) {
        try {
            Report report = reportService.updateReport(id, request);
            return ResponseEntity.ok(ApiResponse.success(report));
        } catch (DuplicateReportPathException e) {
            log.warn("Duplicate report path: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Report already exists: " + e.getExistingReportName() + " uses path '" + e.getDuplicatePath() + "'"));
        } catch (Exception e) {
            log.error("Error updating report: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error updating report: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable String id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Error deleting report: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error deleting report: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<ApiResponse<List<String>>> getReportFiles(@PathVariable String id) {
        try {
            List<String> files = reportService.getReportFiles(id);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            log.error("Error retrieving files for report: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error retrieving files: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/refresh")
    public ResponseEntity<ApiResponse<Report>> refreshReport(@PathVariable String id) {
        try {
            Report report = reportService.refreshReport(id);
            return ResponseEntity.ok(ApiResponse.success(report));
        } catch (Exception e) {
            log.error("Error refreshing report: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Error refreshing report: " + e.getMessage()));
        }
    }
}
