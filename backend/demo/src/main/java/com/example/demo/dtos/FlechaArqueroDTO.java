package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlechaArqueroDTO {
    private Integer numeroRonda;
    private Long idFlecha;
    private Integer puntaje;
}