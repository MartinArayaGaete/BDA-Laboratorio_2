package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectoresAmbientales {
    private Long idZonaAmbiental;
    private Long idCategoriaAmbiental; // FK a CategoriaAmbiental
    private String territorio; // Geometria poligono
}