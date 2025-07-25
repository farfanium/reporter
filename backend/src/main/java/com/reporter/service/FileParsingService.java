package com.reporter.service;

import com.reporter.model.FileData;
import com.reporter.exception.FileAccessException;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvValidationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@Slf4j
public class FileParsingService {

    @Value("${app.nas.base-path}")
    private String nasBasePath;

    public FileData parseFile(String reportPath, String fileName) {
        try {
            Path filePath = Paths.get(nasBasePath, reportPath, fileName);
            if (!Files.exists(filePath)) {
                throw new FileAccessException("File not found: " + filePath);
            }

            String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            
            switch (extension) {
                case "xlsx":
                case "xls":
                    return parseExcelFile(filePath, fileName);
                case "csv":
                    return parseCsvFile(filePath, fileName);
                case "txt":
                    return parseTextFile(filePath, fileName);
                default:
                    throw new FileAccessException("Unsupported file format: " + extension);
            }
        } catch (IOException e) {
            throw new FileAccessException("Error reading file: " + fileName, e);
        }
    }

    private FileData parseExcelFile(Path filePath, String fileName) throws IOException {
        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        
        try (InputStream inputStream = Files.newInputStream(filePath)) {
            Workbook workbook;
            if (fileName.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(inputStream);
            } else {
                workbook = new HSSFWorkbook(inputStream);
            }
            
            Sheet sheet = workbook.getSheetAt(0); // Use first sheet
            Iterator<Row> rowIterator = sheet.iterator();
            
            // Read headers from first row
            if (rowIterator.hasNext()) {
                Row headerRow = rowIterator.next();
                for (Cell cell : headerRow) {
                    headers.add(getCellValueAsString(cell));
                }
            }
            
            // Read data rows
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Map<String, Object> rowData = new HashMap<>();
                
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = row.getCell(i);
                    String header = headers.get(i);
                    Object value = getCellValue(cell);
                    rowData.put(header, value);
                }
                data.add(rowData);
            }
            
            workbook.close();
        }
        
        return FileData.builder()
                .fileName(fileName)
                .headers(headers)
                .data(data)
                .totalRows(data.size())
                .build();
    }

    private FileData parseCsvFile(Path filePath, String fileName) throws IOException {
        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        
        try (Reader reader = Files.newBufferedReader(filePath);
             CSVReader csvReader = new CSVReaderBuilder(reader).build()) {
            
            String[] headerArray = csvReader.readNext();
            if (headerArray != null) {
                headers.addAll(Arrays.asList(headerArray));
            }
            
            String[] row;
            while ((row = csvReader.readNext()) != null) {
                Map<String, Object> rowData = new HashMap<>();
                for (int i = 0; i < Math.min(row.length, headers.size()); i++) {
                    String header = headers.get(i);
                    Object value = parseValue(row[i]);
                    rowData.put(header, value);
                }
                data.add(rowData);
            }
        } catch (CsvValidationException e) {
            throw new FileAccessException("Error parsing CSV file: " + fileName, e);
        }
        
        return FileData.builder()
                .fileName(fileName)
                .headers(headers)
                .data(data)
                .totalRows(data.size())
                .build();
    }

    private FileData parseTextFile(Path filePath, String fileName) throws IOException {
        List<String> lines = Files.readAllLines(filePath);
        
        if (lines.isEmpty()) {
            return FileData.builder()
                    .fileName(fileName)
                    .headers(List.of("Content"))
                    .data(List.of())
                    .totalRows(0)
                    .build();
        }
        
        // Try to detect if it's tab-delimited or space-delimited
        String firstLine = lines.get(0);
        String delimiter = detectDelimiter(firstLine);
        
        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        
        if (delimiter != null) {
            // Parse as delimited text
            String[] headerArray = firstLine.split(delimiter);
            headers.addAll(Arrays.asList(headerArray));
            
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line.trim().isEmpty()) continue;
                
                String[] values = line.split(delimiter);
                Map<String, Object> rowData = new HashMap<>();
                
                for (int j = 0; j < Math.min(values.length, headers.size()); j++) {
                    String header = headers.get(j);
                    Object value = parseValue(values[j].trim());
                    rowData.put(header, value);
                }
                data.add(rowData);
            }
        } else {
            // Treat as single column with line content
            headers.add("Content");
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    Map<String, Object> rowData = new HashMap<>();
                    rowData.put("Content", line);
                    data.add(rowData);
                }
            }
        }
        
        return FileData.builder()
                .fileName(fileName)
                .headers(headers)
                .data(data)
                .totalRows(data.size())
                .build();
    }

    private String detectDelimiter(String line) {
        String[] delimiters = {"\t", "\\|", ";", " {2,}"}; // Tab, pipe, semicolon, multiple spaces
        
        for (String delimiter : delimiters) {
            String[] parts = line.split(delimiter);
            if (parts.length > 1) {
                return delimiter;
            }
        }
        return null;
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return (long) numericValue;
                    } else {
                        return numericValue;
                    }
                }
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    private Object parseValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "";
        }
        
        value = value.trim();
        
        // Try to parse as integer (only if it looks like a pure integer)
        if (value.matches("-?\\d+")) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                // If it's too large for int, try long
                try {
                    return Long.parseLong(value);
                } catch (NumberFormatException e2) {
                    // Fall through to string
                }
            }
        }
        
        // Try to parse as double (only decimal numbers, no scientific notation)
        if (value.matches("-?\\d+\\.\\d+")) {
            try {
                return Double.parseDouble(value);
            } catch (NumberFormatException e) {
                // Not a double, continue
            }
        }
        
        // Try to parse as boolean
        if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
            return Boolean.parseBoolean(value);
        }
        
        // Return as string (preserves alphanumeric codes like 54401E143)
        return value;
    }
}
