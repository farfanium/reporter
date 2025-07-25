package com.reporter.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileInfoEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private ReportEntity report;
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false)
    private Long size;
    
    @Column(name = "last_modified", nullable = false)
    private LocalDateTime lastModified;
    
    @Column(length = 10)
    private String extension;
    
    @Override
    public String toString() {
        return "FileInfoEntity{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", size=" + size +
                ", lastModified=" + lastModified +
                ", extension='" + extension + '\'' +
                '}';
    }
}
