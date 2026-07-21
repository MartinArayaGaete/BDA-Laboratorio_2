package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoCreacionDTO {
    private Long idCategoria;
    private String nombreTorneo;
    private LocalDate fechaInicio;
    private LocalDate fechaTermino;
    private String geomZonaCompetencia;
    private String lineaTiro;
    private Integer nroPlazaMax;
}