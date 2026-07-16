package com.example.demo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PuntajeRonda {
    private Long idPuntajeRonda;
    private Long idRonda;           // FK
    private Long idParticipacion;   // FK
    private Integer puntajeRonda;
}
