package com.reporter.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {
    
    @NotBlank(message = "Report name is required")
    private String name;
    
    @NotBlank(message = "Path is required")
    @Pattern(regexp = "^/.*", message = "Path must start with /")
    private String path;
}
