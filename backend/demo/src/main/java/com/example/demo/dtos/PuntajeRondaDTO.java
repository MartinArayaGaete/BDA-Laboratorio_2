package com.example.demo.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PuntajeRondaDTO {
    private Long idRonda;
    private Long idParticipacion;
    private List<Integer> flechas;
    private Long idAdmin;

}