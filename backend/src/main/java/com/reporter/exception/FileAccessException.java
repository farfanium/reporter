package com.reporter.exception;

public class FileAccessException extends RuntimeException {
    public FileAccessException(String message) {
        super(message);
    }
    
    public FileAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
