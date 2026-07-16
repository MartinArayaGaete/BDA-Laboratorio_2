package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoMapaDTO {
    private Long idTorneo;
    private String nombreTorneo;
    private String geomZonaCompetencia; // Polígono GeoJSON
    private String lineaTiro;           // LineString GeoJSON
}