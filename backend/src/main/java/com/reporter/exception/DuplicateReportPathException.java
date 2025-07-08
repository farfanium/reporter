package com.reporter.exception;

public class DuplicateReportPathException extends RuntimeException {
    private final String existingReportName;
    private final String duplicatePath;

    public DuplicateReportPathException(String duplicatePath, String existingReportName) {
        super("A report with path '" + duplicatePath + "' already exists: " + existingReportName);
        this.duplicatePath = duplicatePath;
        this.existingReportName = existingReportName;
    }

    public String getExistingReportName() {
        return existingReportName;
    }

    public String getDuplicatePath() {
        return duplicatePath;
    }
}
