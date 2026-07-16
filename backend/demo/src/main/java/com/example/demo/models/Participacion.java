package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participacion {
    private Long idParticipacion;
    private Long idUsuario; // FK
    private Long idTorneo;  // FK
    private Integer puntajeFinal;
    private Integer posicionFinal;
    private String ubicacionArquero; // geometria punto
    private String ubicacionBlanco;  // geometria punto

}