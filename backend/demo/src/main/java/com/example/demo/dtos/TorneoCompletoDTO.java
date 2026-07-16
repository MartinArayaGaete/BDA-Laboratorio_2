package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoCompletoDTO {
    private Long idTorneo;
    private String nombreTorneo;
    private String estadoTorneo;
    private String geomZonaCompetencia;  // GeoJSON Polygon
    private String lineaTiro;            // GeoJSON LineString
    private List<ArqueroPosicionDTO> arqueros;
}