package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArqueroPosicionDTO {
    private Long idParticipacion;
    private Long idUsuario;
    private String nombre;
    private String rut;
    private String ubicacionArquero;  // GeoJSON Point
    private String ubicacionBlanco;   // GeoJSON Point
}