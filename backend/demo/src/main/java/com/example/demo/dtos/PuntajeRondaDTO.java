package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PuntajeRondaDTO {
    private Long idRonda;
    private Long idParticipacion;
    private Long idAdmin;
    private List<Integer> flechas;
    private String posicionArquero;  //  Geo Point
    private String posicionDiana;    // Geo Point
}