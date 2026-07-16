package com.example.demo.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoListadoDTO {
    private Long idTorneo;
    private Long idCategoria;
    private String nombreTorneo;
    private String estadoTorneo;
    private LocalDate fechaInicio;
    private LocalDate fechaTermino;
    private String geomZonaCompetencia;
}