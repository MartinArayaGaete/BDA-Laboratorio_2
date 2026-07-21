package com.example.demo.models;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Torneo {
    private Long idTorneo;
    private Long idCategoria;
    private String nombreTorneo;
    private String estadoTorneo;
    private LocalDate fechaInicio;
    private LocalDate fechaTermino;
    private String geomZonaCompetencia;
    private String lineaTiro;
    private Integer nroPlazaMax;
    private Integer nroPlazaActual;
}