package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TorneoAdminDTO {
    private Long idTorneo;
    private String nombreTorneo;
    private LocalDate fechaInicio;
    private LocalDate fechaTermino; 
    private String estadoTorneo; // "NOT_STARTED", "ON_COURSE", "FINISHED"
}