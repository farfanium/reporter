package com.reporter.service;

import com.reporter.dto.FolderItem;
import com.reporter.exception.FileAccessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class FolderService {

    @Value("${app.nas.base-path}")
    private String basePath;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<FolderItem> getFolders(String requestedPath) {
        try {
            // Resolve the actual path
            Path resolvedPath = resolveAndValidatePath(requestedPath);
            
            log.debug("Browsing folders in: {}", resolvedPath);
            
            if (!Files.exists(resolvedPath)) {
                log.warn("Path does not exist: {}", resolvedPath);
                return new ArrayList<>();
            }
            
            if (!Files.isDirectory(resolvedPath)) {
                log.warn("Path is not a directory: {}", resolvedPath);
                return new ArrayList<>();
            }
            
            // List directories and files
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(resolvedPath)) {
                List<FolderItem> items = new ArrayList<>();
                
                for (Path path : stream) {
                    try {
                        FolderItem item = createFolderItem(path, requestedPath);
                        items.add(item);
                    } catch (Exception e) {
                        log.warn("Error processing item: {}", path, e);
                        // Continue processing other items
                    }
                }
                
                // Sort by name, directories first
                items.sort((a, b) -> {
                    if (a.isDirectory() && !b.isDirectory()) return -1;
                    if (!a.isDirectory() && b.isDirectory()) return 1;
                    return a.getName().compareToIgnoreCase(b.getName());
                });
                
                log.debug("Found {} items in {}", items.size(), resolvedPath);
                return items;
                
            } catch (IOException e) {
                log.error("Error reading directory: {}", resolvedPath, e);
                throw new FileAccessException("Cannot read directory: " + resolvedPath);
            }
            
        } catch (Exception e) {
            log.error("Error getting folders for path: {}", requestedPath, e);
            throw new FileAccessException("Failed to browse folders: " + e.getMessage());
        }
    }

    public boolean isValidPath(String requestedPath) {
        try {
            Path resolvedPath = resolveAndValidatePath(requestedPath);
            return Files.exists(resolvedPath) && Files.isDirectory(resolvedPath);
        } catch (Exception e) {
            log.debug("Path validation failed for: {}", requestedPath, e);
            return false;
        }
    }

    private Path resolveAndValidatePath(String requestedPath) {
        // Handle root path
        if ("/".equals(requestedPath)) {
            return Paths.get(basePath);
        }
        
        // Remove leading slash and resolve relative to base path
        String normalizedPath = requestedPath.startsWith("/") ? requestedPath.substring(1) : requestedPath;
        Path resolvedPath = Paths.get(basePath, normalizedPath).normalize();
        
        // Security check: ensure the resolved path is within the base path
        Path basePathNormalized = Paths.get(basePath).normalize();
        if (!resolvedPath.startsWith(basePathNormalized)) {
            throw new SecurityException("Access denied: Path outside of allowed directory");
        }
        
        return resolvedPath;
    }

    private FolderItem createFolderItem(Path path, String requestedPath) throws IOException {
        String fileName = path.getFileName().toString();
        boolean isDirectory = Files.isDirectory(path);
        
        // Create the logical path for the frontend
        String logicalPath;
        if ("/".equals(requestedPath)) {
            logicalPath = "/" + fileName;
        } else {
            logicalPath = requestedPath.endsWith("/") ? requestedPath + fileName : requestedPath + "/" + fileName;
        }
        
        // Check if folder has subfolders (only for directories)
        boolean hasSubfolders = isDirectory && hasSubdirectories(path);
        
        // Get file attributes
        long size = 0;
        String lastModified = "";
        
        try {
            BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
            size = attrs.size();
            lastModified = LocalDateTime.ofInstant(attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault())
                    .format(dateFormatter);
        } catch (IOException e) {
            log.debug("Could not read attributes for: {}", path, e);
        }
        
        return new FolderItem(fileName, logicalPath, isDirectory, hasSubfolders, size, lastModified);
    }

    private boolean hasSubdirectories(Path path) {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(path, Files::isDirectory)) {
            return stream.iterator().hasNext();
        } catch (IOException e) {
            log.debug("Could not check subdirectories for: {}", path, e);
            return false;
        }
    }
}
