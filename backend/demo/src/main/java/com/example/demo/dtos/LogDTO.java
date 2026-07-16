package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogDTO {
    private Long idLog;
    private Long idAdmin;
    private String nombreAdmin;
    private String nombreAfectado;
    private String nombreTorneo;
    private Integer numeroRonda;
    private Integer puntajeAnterior;
    private Integer puntajeNuevo;
    private LocalDateTime fechaEditado;
}