package com.reporter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.reporter.entity.ReportEntity;
import com.reporter.mapper.ReportMapper;
import com.reporter.model.Report;
import com.reporter.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class YamlMigrationService {
    
    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    
    @Value("${app.storage.config-path}")
    private String yamlConfigPath;
    
    private final ObjectMapper yamlMapper;
    
    public YamlMigrationService(ReportRepository reportRepository, ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.reportMapper = reportMapper;
        this.yamlMapper = new ObjectMapper(new YAMLFactory());
        this.yamlMapper.registerModule(new JavaTimeModule());
    }
    
    @Transactional
    public boolean migrateFromYamlIfNeeded() {
        // Check if database is empty and YAML file exists
        if (reportRepository.count() > 0) {
            log.info("Database already contains reports, skipping YAML migration");
            return false;
        }
        
        Path yamlPath = Paths.get(yamlConfigPath);
        if (!Files.exists(yamlPath)) {
            log.info("No YAML configuration file found at: {}", yamlConfigPath);
            return false;
        }
        
        try {
            log.info("Starting migration from YAML configuration: {}", yamlConfigPath);
            ReportConfig yamlConfig = yamlMapper.readValue(yamlPath.toFile(), ReportConfig.class);
            
            if (yamlConfig == null || yamlConfig.getReports() == null || yamlConfig.getReports().isEmpty()) {
                log.info("No reports found in YAML configuration");
                return false;
            }
            
            int migratedCount = 0;
            for (Report report : yamlConfig.getReports()) {
                try {
                    migrateReport(report);
                    migratedCount++;
                } catch (Exception e) {
                    log.error("Failed to migrate report: {} (ID: {})", report.getName(), report.getId(), e);
                }
            }
            
            // Backup the YAML file
            backupYamlFile(yamlPath);
            
            log.info("Successfully migrated {} reports from YAML to database", migratedCount);
            return true;
            
        } catch (IOException e) {
            log.error("Failed to read YAML configuration file", e);
            throw new RuntimeException("YAML migration failed", e);
        }
    }
    
    private void migrateReport(Report report) {
        // Ensure timestamps are set
        if (report.getCreatedAt() == null) {
            report.setCreatedAt(LocalDateTime.now());
        }
        if (report.getUpdatedAt() == null) {
            report.setUpdatedAt(report.getCreatedAt());
        }
        
        // Convert to entity and save
        ReportEntity entity = reportMapper.toEntity(report);
        reportRepository.save(entity);
        
        log.debug("Migrated report: {} (ID: {}) with {} files", 
                report.getName(), report.getId(), 
                report.getFiles() != null ? report.getFiles().size() : 0);
    }
    
    private void backupYamlFile(Path yamlPath) {
        try {
            Path backupPath = Paths.get(yamlPath.toString() + ".backup." + System.currentTimeMillis());
            Files.copy(yamlPath, backupPath);
            log.info("Created backup of YAML file: {}", backupPath);
        } catch (IOException e) {
            log.warn("Failed to create backup of YAML file", e);
        }
    }
    
    // Inner class for YAML configuration (same as in ReportService)
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
