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
    private String geomZonaCompetencia;
    private String lineaTiro;
    private List<ArqueroPosicionDTO> arqueros;
}