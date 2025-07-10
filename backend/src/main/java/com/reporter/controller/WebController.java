package com.reporter.controller;

import com.reporter.model.Report;
import com.reporter.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebController {

    private final ReportService reportService;

    @GetMapping("/")
    public String index(Model model) {
        try {
            List<Report> reports = reportService.getAllReports();
            model.addAttribute("reports", reports);
            return "index";
        } catch (Exception e) {
            log.error("Error loading reports", e);
            model.addAttribute("error", "Error loading reports: " + e.getMessage());
            return "error";
        }
    }

    // All functionality is now handled by the single-page application in index.html
    // API endpoints are handled by dedicated REST controllers
}
