package com.reporter.service;

import com.reporter.model.Report;
import com.reporter.dto.CreateReportRequest;
import com.reporter.dto.FileInfo;
import com.reporter.exception.ReportNotFoundException;
import com.reporter.exception.FileAccessException;
import com.reporter.exception.DuplicateReportPathException;
import com.reporter.entity.ReportEntity;
import com.reporter.entity.FileInfoEntity;
import com.reporter.repository.ReportRepository;
import com.reporter.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    @Value("${app.nas.base-path}")
    private String nasBasePath;

    @Value("${app.nas.allowed-extensions}")
    private String allowedExtensions;

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    private final YamlMigrationService yamlMigrationService;

    @PostConstruct
    public void init() {
        // Try to migrate from YAML if needed
        yamlMigrationService.migrateFromYamlIfNeeded();
    }

    public List<Report> getAllReports() {
        List<ReportEntity> entities = reportRepository.findAll();
        return reportMapper.toModelList(entities);
    }

    public Report getReportById(String id) {
        ReportEntity entity = reportRepository.findById(id)
                .orElseThrow(() -> new ReportNotFoundException("Report with id " + id + " not found"));
        return reportMapper.toModel(entity);
    }

    @Transactional
    public Report createReport(CreateReportRequest request) {
        // Check for duplicate path
        if (reportRepository.findByPath(request.getPath()).isPresent()) {
            ReportEntity existing = reportRepository.findByPath(request.getPath()).get();
            throw new DuplicateReportPathException(request.getPath(), existing.getName());
        }
        
        String reportId = UUID.randomUUID().toString();
        List<String> files = scanReportFiles(request.getPath());
        List<FileInfo> fileDetails = scanReportFileDetails(request.getPath());
        
        ReportEntity entity = ReportEntity.builder()
                .id(reportId)
                .name(request.getName())
                .path(request.getPath())
                .files(files)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // Add file details with proper relationship
        if (fileDetails != null) {
            for (FileInfo fileInfo : fileDetails) {
                FileInfoEntity fileInfoEntity = FileInfoEntity.builder()
                        .name(fileInfo.getName())
                        .size(fileInfo.getSize())
                        .lastModified(fileInfo.getLastModified())
                        .extension(fileInfo.getExtension())
                        .build();
                entity.addFileDetail(fileInfoEntity);
            }
        }

        ReportEntity savedEntity = reportRepository.save(entity);
        Report report = reportMapper.toModel(savedEntity);
        
        log.info("Created new report: {} with {} files", report.getName(), files.size());
        return report;
    }

    @Transactional
    public Report updateReport(String id, CreateReportRequest request) {
        ReportEntity existingEntity = reportRepository.findById(id)
                .orElseThrow(() -> new ReportNotFoundException("Report with id " + id + " not found"));

        // Check for duplicate path (excluding current report)
        reportRepository.findByPath(request.getPath())
                .filter(entity -> !entity.getId().equals(id))
                .ifPresent(duplicate -> {
                    throw new DuplicateReportPathException(request.getPath(), duplicate.getName());
                });

        List<String> files = scanReportFiles(request.getPath());
        List<FileInfo> fileDetails = scanReportFileDetails(request.getPath());
        
        // Clear existing file details
        existingEntity.clearFileDetails();
        
        // Update basic fields
        existingEntity.setName(request.getName());
        existingEntity.setPath(request.getPath());
        existingEntity.setFiles(files);
        existingEntity.setUpdatedAt(LocalDateTime.now());
        
        // Add new file details
        if (fileDetails != null) {
            for (FileInfo fileInfo : fileDetails) {
                FileInfoEntity fileInfoEntity = FileInfoEntity.builder()
                        .name(fileInfo.getName())
                        .size(fileInfo.getSize())
                        .lastModified(fileInfo.getLastModified())
                        .extension(fileInfo.getExtension())
                        .build();
                existingEntity.addFileDetail(fileInfoEntity);
            }
        }

        ReportEntity savedEntity = reportRepository.save(existingEntity);
        Report report = reportMapper.toModel(savedEntity);
        
        log.info("Updated report: {} with {} files", report.getName(), files.size());
        return report;
    }

    @Transactional
    public void deleteReport(String id) {
        ReportEntity entity = reportRepository.findById(id)
                .orElseThrow(() -> new ReportNotFoundException("Report with id " + id + " not found"));
        
        reportRepository.delete(entity);
        log.info("Deleted report: {}", entity.getName());
    }

    @Transactional
    public Report refreshReport(String id) {
        ReportEntity entity = reportRepository.findById(id)
                .orElseThrow(() -> new ReportNotFoundException("Report with id " + id + " not found"));

        List<String> currentFiles = scanReportFiles(entity.getPath());
        List<FileInfo> currentFileDetails = scanReportFileDetails(entity.getPath());
        
        // Clear existing file details
        entity.clearFileDetails();
        
        // Update files and file details
        entity.setFiles(currentFiles);
        entity.setUpdatedAt(LocalDateTime.now());
        
        // Add current file details
        if (currentFileDetails != null) {
            for (FileInfo fileInfo : currentFileDetails) {
                FileInfoEntity fileInfoEntity = FileInfoEntity.builder()
                        .name(fileInfo.getName())
                        .size(fileInfo.getSize())
                        .lastModified(fileInfo.getLastModified())
                        .extension(fileInfo.getExtension())
                        .build();
                entity.addFileDetail(fileInfoEntity);
            }
        }

        ReportEntity savedEntity = reportRepository.save(entity);
        Report report = reportMapper.toModel(savedEntity);
        
        log.info("Refreshed report: {} with {} files", report.getName(), currentFiles.size());
        return report;
    }

    public List<String> getReportFiles(String reportId) {
        ReportEntity entity = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException("Report with id " + reportId + " not found"));
        return entity.getFiles();
    }

    private List<String> scanReportFiles(String reportPath) {
        try {
            Path fullPath = resolveReportPath(reportPath);
            if (!Files.exists(fullPath) || !Files.isDirectory(fullPath)) {
                throw new FileAccessException("Report path does not exist or is not a directory: " + fullPath);
            }

            List<String> allowedExts = List.of(allowedExtensions.split(","));
            
            return Files.list(fullPath)
                    .filter(Files::isRegularFile)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .filter(filename -> {
                        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                        return allowedExts.contains(ext);
                    })
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new FileAccessException("Error scanning report files: " + e.getMessage(), e);
        }
    }

    private List<FileInfo> scanReportFileDetails(String reportPath) {
        try {
            Path fullPath = resolveReportPath(reportPath);
            if (!Files.exists(fullPath) || !Files.isDirectory(fullPath)) {
                throw new FileAccessException("Report path does not exist or is not a directory: " + fullPath);
            }

            List<String> allowedExts = List.of(allowedExtensions.split(","));
            
            return Files.list(fullPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String filename = path.getFileName().toString();
                        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                        return allowedExts.contains(ext);
                    })
                    .map(path -> {
                        try {
                            String filename = path.getFileName().toString();
                            String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                            long size = Files.size(path);
                            LocalDateTime lastModified = LocalDateTime.ofInstant(
                                Files.getLastModifiedTime(path).toInstant(),
                                java.time.ZoneId.systemDefault()
                            );
                            
                            return FileInfo.builder()
                                    .name(filename)
                                    .size(size)
                                    .lastModified(lastModified)
                                    .extension(ext)
                                    .build();
                        } catch (IOException e) {
                            throw new RuntimeException("Error getting file details: " + e.getMessage(), e);
                        }
                    })
                    .sorted((a, b) -> a.getName().compareTo(b.getName()))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new FileAccessException("Error scanning report file details: " + e.getMessage(), e);
        }
    }

    private Path resolveReportPath(String reportPath) {
        // Handle root path
        if ("/".equals(reportPath)) {
            return Paths.get(nasBasePath);
        }
        
        // Remove leading slash and resolve relative to base path
        String normalizedPath = reportPath.startsWith("/") ? reportPath.substring(1) : reportPath;
        Path resolvedPath = Paths.get(nasBasePath, normalizedPath).normalize();
        
        // Security check: ensure the resolved path is within the base path
        Path basePathNormalized = Paths.get(nasBasePath).normalize();
        if (!resolvedPath.startsWith(basePathNormalized)) {
            throw new SecurityException("Access denied: Path outside of allowed directory");
        }
        
        return resolvedPath;
    }
}
