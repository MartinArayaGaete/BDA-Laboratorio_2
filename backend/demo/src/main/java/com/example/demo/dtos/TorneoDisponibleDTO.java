package com.example.demo.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoDisponibleDTO {
    private Long idTorneo;
    private String nombreTorneo;
    private String estadoTorneo;
    private LocalDate fechaInicio;
    private LocalDate fechaTermino;
    private Long idCategoria;
    private String nombreCategoria;
}
