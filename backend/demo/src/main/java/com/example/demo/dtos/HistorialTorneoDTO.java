package com.example.demo.dtos;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialTorneoDTO {
    private Long idTorneo;
    private String nombreTorneo;
    private Integer puntajeFinal;
    private Integer posicionFinal;
    private LocalDate fechaInicio;
    private String estadoTorneo;
    private List<HistorialRondaDTO> rondas;
}