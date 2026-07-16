package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InscritoDTO {
    private Long idParticipacion;
    private Long idUsuario;
    private String rut;
    private String nombre;
    private String ubicacionArquero;
    private String ubicacionBlanco;
}