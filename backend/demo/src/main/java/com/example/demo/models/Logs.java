package com.example.demo.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Logs {
    private Long idLogs;
    private Long idAdmin;      // FK
    private Long idAfectado;   // FK
    private LocalDateTime fechaEditado;
    private Long torneoAfectado;
    private Long rondaAfectada;
    private Integer puntajeAnterior;
    private Integer puntajeNuevo;
}