package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogsPaginadosResponse {
    private List<LogDTO> logs;       // ← Se llama "logs", NO "content"
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}