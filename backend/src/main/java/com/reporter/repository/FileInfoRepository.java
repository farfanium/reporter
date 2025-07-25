package com.reporter.repository;

import com.reporter.entity.FileInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileInfoRepository extends JpaRepository<FileInfoEntity, Long> {
    
    List<FileInfoEntity> findByReportId(String reportId);
    
    List<FileInfoEntity> findByExtension(String extension);
    
    @Query("SELECT f FROM FileInfoEntity f WHERE f.report.id = :reportId ORDER BY f.name ASC")
    List<FileInfoEntity> findByReportIdOrderByName(@Param("reportId") String reportId);
    
    @Query("SELECT f FROM FileInfoEntity f WHERE f.report.id = :reportId ORDER BY f.lastModified DESC")
    List<FileInfoEntity> findByReportIdOrderByLastModified(@Param("reportId") String reportId);
    
    void deleteByReportId(String reportId);
}
