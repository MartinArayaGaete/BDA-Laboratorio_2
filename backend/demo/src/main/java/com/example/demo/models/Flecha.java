package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flecha {
    private Long idFlecha;
    private Long idPuntajeRonda; // FK
    private Integer puntaje;
}