package com.example.demo.controllers;

import com.example.demo.dtos.LogsPaginadosResponse;
import com.example.demo.services.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    // GET /api/logs?page=0&size=10
    @GetMapping
    public ResponseEntity<LogsPaginadosResponse> obtenerLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        LogsPaginadosResponse response = logService.obtenerAuditoriaPaginada(page, size);
        return ResponseEntity.ok(response);
    }
}