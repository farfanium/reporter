package com.reporter.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEntity {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, unique = true, length = 500)
    private String path;
    
    @ElementCollection
    @CollectionTable(name = "report_files", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "file_name")
    @Builder.Default
    private List<String> files = new ArrayList<>();
    
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FileInfoEntity> fileDetails = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods for managing bidirectional relationship
    public void addFileDetail(FileInfoEntity fileDetail) {
        fileDetails.add(fileDetail);
        fileDetail.setReport(this);
    }
    
    public void removeFileDetail(FileInfoEntity fileDetail) {
        fileDetails.remove(fileDetail);
        fileDetail.setReport(null);
    }
    
    public void clearFileDetails() {
        fileDetails.forEach(fileDetail -> fileDetail.setReport(null));
        fileDetails.clear();
    }
}
