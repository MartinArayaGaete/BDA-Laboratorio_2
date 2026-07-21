package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
    private Integer nroPlazaMax;
    private Integer nroPlazaActual;
}