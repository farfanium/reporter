-- Create reports table
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create file_info table
CREATE TABLE file_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    extension VARCHAR(10),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Create report_files table for ElementCollection
CREATE TABLE report_files (
    report_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_reports_path ON reports(path);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_file_info_report_id ON file_info(report_id);
CREATE INDEX idx_file_info_extension ON file_info(extension);
CREATE INDEX idx_file_info_last_modified ON file_info(last_modified);
CREATE INDEX idx_report_files_report_id ON report_files(report_id);
