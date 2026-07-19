package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaAmbientalDTO {
    private String condicionClimatica;
    private Integer totalFlechas;
    private Double promedioPuntaje;
    private Double desviacionPrecision; // te maldigo inferencial, pero la desviacion estandar es para ver si hay correlacion
}