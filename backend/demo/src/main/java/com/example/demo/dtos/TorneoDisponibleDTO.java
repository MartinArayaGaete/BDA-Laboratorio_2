package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
    private Integer nroPlazaMax;
    private Integer nroPlazaActual;
    private Integer plazasDisponibles;
}