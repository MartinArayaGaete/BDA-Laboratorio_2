package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ZonaAmbientalDTO {
    private Long idZona;
    private String tipo;
    private String geomArea; // Polígono GeoJSON del clima
}