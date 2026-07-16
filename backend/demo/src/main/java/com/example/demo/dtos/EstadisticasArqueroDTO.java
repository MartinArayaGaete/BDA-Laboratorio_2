package com.example.demo.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticasArqueroDTO {
    private Integer torneosTotales;
    private Integer totalFlechas;
    private Integer flechasAcertadas;
    private Integer porcentajeAcierto;
    private Integer totalPuntos;
    private Double promedioPuntos;
}