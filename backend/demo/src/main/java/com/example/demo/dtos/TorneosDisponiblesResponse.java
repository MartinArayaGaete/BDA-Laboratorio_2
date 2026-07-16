package com.example.demo.dtos;

import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneosDisponiblesResponse {
    private List<TorneoDisponibleDTO> content;
    private Integer page;
    private Integer size;
    private Long totalElements;
    private Integer totalPages;
}