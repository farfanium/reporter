package com.reporter.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FolderItem {
    private String name;
    private String path;
    private boolean isDirectory;
    private boolean hasSubfolders;
    private long size;
    private String lastModified;
}
