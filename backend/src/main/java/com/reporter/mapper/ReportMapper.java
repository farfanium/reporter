package com.reporter.mapper;

import com.reporter.dto.FileInfo;
import com.reporter.entity.FileInfoEntity;
import com.reporter.entity.ReportEntity;
import com.reporter.model.Report;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReportMapper {
    
    public Report toModel(ReportEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return Report.builder()
                .id(entity.getId())
                .name(entity.getName())
                .path(entity.getPath())
                .files(entity.getFiles())
                .fileDetails(entity.getFileDetails().stream()
                        .map(this::toFileInfo)
                        .collect(Collectors.toList()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public ReportEntity toEntity(Report model) {
        if (model == null) {
            return null;
        }
        
        ReportEntity entity = ReportEntity.builder()
                .id(model.getId())
                .name(model.getName())
                .path(model.getPath())
                .files(model.getFiles())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
        
        // Handle file details with bidirectional relationship
        if (model.getFileDetails() != null) {
            List<FileInfoEntity> fileInfoEntities = model.getFileDetails().stream()
                    .map(fileInfo -> toFileInfoEntity(fileInfo, entity))
                    .collect(Collectors.toList());
            entity.setFileDetails(fileInfoEntities);
        }
        
        return entity;
    }
    
    public FileInfo toFileInfo(FileInfoEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return FileInfo.builder()
                .name(entity.getName())
                .size(entity.getSize())
                .lastModified(entity.getLastModified())
                .extension(entity.getExtension())
                .build();
    }
    
    public FileInfoEntity toFileInfoEntity(FileInfo dto, ReportEntity report) {
        if (dto == null) {
            return null;
        }
        
        return FileInfoEntity.builder()
                .report(report)
                .name(dto.getName())
                .size(dto.getSize())
                .lastModified(dto.getLastModified())
                .extension(dto.getExtension())
                .build();
    }
    
    public List<Report> toModelList(List<ReportEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }
}
