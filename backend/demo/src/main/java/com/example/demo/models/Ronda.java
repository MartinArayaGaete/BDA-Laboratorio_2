package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ronda {
    private Long idRonda;
    private Long idTorneo;
    private Integer numeroRonda;
    private Long idZonaAmbiental;
}