package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ronda {
    private Long idRonda;
    private Long idTorneo; // FK
    private Integer numeroRonda;
}