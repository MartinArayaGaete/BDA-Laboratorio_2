package com.example.demo.services;

import com.example.demo.dtos.LogDTO;
import com.example.demo.dtos.LogsPaginadosResponse;
import com.example.demo.repositories.LogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public LogsPaginadosResponse obtenerAuditoriaPaginada(int page, int size) {
        if (page < 0 || size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parámetros de paginación inválidos");
        }

        long totalElements = logRepository.contarLogs();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // Prevenir que pidan una página que no existe
        if (page >= totalPages && totalElements > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La página solicitada supera el total de páginas");
        }

        int offset = page * size;
        List<LogDTO> logs = logRepository.obtenerLogsRecientes(size, offset);

        return new LogsPaginadosResponse(logs, page, size, totalElements, totalPages);
    }
}