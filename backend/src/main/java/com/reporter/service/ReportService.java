package com.reporter.service;

import com.reporter.model.Report;
import com.reporter.dto.CreateReportRequest;
import com.reporter.dto.FileInfo;
import com.reporter.exception.ReportNotFoundException;
import com.reporter.exception.FileAccessException;
import com.reporter.exception.DuplicateReportPathException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReportService {

    @Value("${app.nas.base-path}")
    private String nasBasePath;

    @Value("${app.storage.config-path}")
    private String configPath;

    @Value("${app.nas.allowed-extensions}")
    private String allowedExtensions;

    private final ObjectMapper yamlMapper;
    private final Map<String, Report> reportCache = new ConcurrentHashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public ReportService() {
        this.yamlMapper = new ObjectMapper(new YAMLFactory());
        this.yamlMapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    public void init() {
        loadReports();
    }

    public List<Report> getAllReports() {
        lock.readLock().lock();
        try {
            return List.copyOf(reportCache.values());
        } finally {
            lock.readLock().unlock();
        }
    }

    public Report getReportById(String id) {
        lock.readLock().lock();
        try {
            Report report = reportCache.get(id);
            if (report == null) {
                throw new ReportNotFoundException("Report with id " + id + " not found");
            }
            return report;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Report createReport(CreateReportRequest request) {
        lock.writeLock().lock();
        try {
            // Check for duplicate path
            Report existingReport = reportCache.values().stream()
                    .filter(report -> report.getPath().equals(request.getPath()))
                    .findFirst()
                    .orElse(null);
            
            if (existingReport != null) {
                throw new DuplicateReportPathException(request.getPath(), existingReport.getName());
            }
            
            String reportId = UUID.randomUUID().toString();
            List<String> files = scanReportFiles(request.getPath());
            List<FileInfo> fileDetails = scanReportFileDetails(request.getPath());
            
            Report report = Report.builder()
                    .id(reportId)
                    .name(request.getName())
                    .path(request.getPath())
                    .files(files)
                    .fileDetails(fileDetails)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            reportCache.put(reportId, report);
            saveReports();
            
            log.info("Created new report: {} with {} files", report.getName(), files.size());
            return report;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Report updateReport(String id, CreateReportRequest request) {
        lock.writeLock().lock();
        try {
            Report existingReport = reportCache.get(id);
            if (existingReport == null) {
                throw new ReportNotFoundException("Report with id " + id + " not found");
            }

            // Check for duplicate path (excluding current report)
            Report duplicateReport = reportCache.values().stream()
                    .filter(report -> !report.getId().equals(id) && report.getPath().equals(request.getPath()))
                    .findFirst()
                    .orElse(null);
            
            if (duplicateReport != null) {
                throw new DuplicateReportPathException(request.getPath(), duplicateReport.getName());
            }

            List<String> files = scanReportFiles(request.getPath());
            List<FileInfo> fileDetails = scanReportFileDetails(request.getPath());
            
            Report updatedReport = Report.builder()
                    .id(id)
                    .name(request.getName())
                    .path(request.getPath())
                    .files(files)
                    .fileDetails(fileDetails)
                    .createdAt(existingReport.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();

            reportCache.put(id, updatedReport);
            saveReports();
            
            log.info("Updated report: {} with {} files", updatedReport.getName(), files.size());
            return updatedReport;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void deleteReport(String id) {
        lock.writeLock().lock();
        try {
            Report report = reportCache.remove(id);
            if (report == null) {
                throw new ReportNotFoundException("Report with id " + id + " not found");
            }
            saveReports();
            log.info("Deleted report: {}", report.getName());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Report refreshReport(String id) {
        lock.writeLock().lock();
        try {
            Report report = reportCache.get(id);
            if (report == null) {
                throw new ReportNotFoundException("Report with id " + id + " not found");
            }

            List<String> currentFiles = scanReportFiles(report.getPath());
            List<FileInfo> currentFileDetails = scanReportFileDetails(report.getPath());
            Report updatedReport = Report.builder()
                    .id(report.getId())
                    .name(report.getName())
                    .path(report.getPath())
                    .files(currentFiles)
                    .fileDetails(currentFileDetails)
                    .createdAt(report.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();

            reportCache.put(id, updatedReport);
            saveReports();
            
            log.info("Refreshed report: {} with {} files", updatedReport.getName(), currentFiles.size());
            return updatedReport;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<String> getReportFiles(String reportId) {
        lock.readLock().lock();
        try {
            Report report = reportCache.get(reportId);
            if (report == null) {
                throw new ReportNotFoundException("Report with id " + reportId + " not found");
            }
            return refreshReportFiles(report);
        } finally {
            lock.readLock().unlock();
        }
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

    private List<String> refreshReportFiles(Report report) {
        try {
            List<String> currentFiles = scanReportFiles(report.getPath());
            List<FileInfo> currentFileDetails = scanReportFileDetails(report.getPath());
            if (!currentFiles.equals(report.getFiles())) {
                // Update the report with new file list
                Report updatedReport = Report.builder()
                        .id(report.getId())
                        .name(report.getName())
                        .path(report.getPath())
                        .files(currentFiles)
                        .fileDetails(currentFileDetails)
                        .createdAt(report.getCreatedAt())
                        .updatedAt(LocalDateTime.now())
                        .build();
                
                reportCache.put(report.getId(), updatedReport);
                saveReports();
                log.info("Refreshed files for report: {}", report.getName());
            }
            return currentFiles;
        } catch (Exception e) {
            log.error("Error refreshing files for report: {}", report.getName(), e);
            return report.getFiles(); // Return cached files if refresh fails
        }
    }

    private void loadReports() {
        try {
            Path configFilePath = Paths.get(configPath);
            if (Files.exists(configFilePath)) {
                ReportConfig config = yamlMapper.readValue(configFilePath.toFile(), ReportConfig.class);
                if (config != null && config.getReports() != null) {
                    config.getReports().forEach(report -> reportCache.put(report.getId(), report));
                    log.info("Loaded {} reports from configuration", reportCache.size());
                }
            } else {
                log.info("No existing configuration found, starting with empty reports");
            }
        } catch (IOException e) {
            log.error("Error loading reports configuration", e);
        }
    }

    private void saveReports() {
        try {
            Path configFilePath = Paths.get(configPath);
            Files.createDirectories(configFilePath.getParent());
            
            ReportConfig config = new ReportConfig();
            config.setReports(List.copyOf(reportCache.values()));
            
            yamlMapper.writeValue(configFilePath.toFile(), config);
            log.debug("Saved {} reports to configuration", reportCache.size());
        } catch (IOException e) {
            log.error("Error saving reports configuration", e);
        }
    }

    // Inner class for YAML configuration
    public static class ReportConfig {
        private List<Report> reports;

        public List<Report> getReports() {
            return reports;
        }

        public void setReports(List<Report> reports) {
            this.reports = reports;
        }
    }
}
