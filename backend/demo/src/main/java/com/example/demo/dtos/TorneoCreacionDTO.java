package com.example.demo.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

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
}