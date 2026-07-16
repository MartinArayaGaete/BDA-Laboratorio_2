package com.example.demo.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialArqueroResponse {
    private List<HistorialTorneoDTO> torneos;
    private Integer page;
    private Integer size;
    private Long totalElements;
    private Integer totalPages;
}
