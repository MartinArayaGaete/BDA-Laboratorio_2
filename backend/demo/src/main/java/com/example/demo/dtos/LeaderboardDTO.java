package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardDTO {
    private Long idUsuario;
    private String nombre;
    private Double promedioPuntosFlecha;
    private Integer posicion;
}