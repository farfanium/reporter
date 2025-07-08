package com.reporter.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileData {
    private String fileName;
    private List<String> headers;
    private List<Map<String, Object>> data;
    private Integer totalRows;
}
