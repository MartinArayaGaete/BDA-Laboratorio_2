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
    private List<Integer> flechas;        // Puede ser null para solo posicionar
    private String posicionArquero;
    private String posicionDiana;
}