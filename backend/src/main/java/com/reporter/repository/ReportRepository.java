package com.reporter.repository;

import com.reporter.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity, String> {
    
    Optional<ReportEntity> findByPath(String path);
    
    List<ReportEntity> findByNameContainingIgnoreCase(String name);
    
    List<ReportEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT r FROM ReportEntity r WHERE r.path != :excludePath AND r.path = :path")
    Optional<ReportEntity> findByPathExcludingId(@Param("path") String path, @Param("excludePath") String excludePath);
    
    @Query("SELECT COUNT(r) FROM ReportEntity r")
    long countAllReports();
}
