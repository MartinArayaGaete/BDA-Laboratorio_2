package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumenTorneoArqueroDTO {
    private Integer puntajeFinal;
    private Integer posicionFinal;
    private Integer totalFlechas;
    private Double promedioPuntos;
    private Integer rondasJugadas;
    private String factoresAmbientales;
}