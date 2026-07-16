package com.example.demo.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialRondaDTO {
    private Integer numeroRonda;
    private Integer puntajeRonda;
    private List<HistorialFlechaDTO> flechas;
}
