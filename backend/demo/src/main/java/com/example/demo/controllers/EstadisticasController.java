package com.example.demo.controllers;

import com.example.demo.dtos.EstadisticaAmbientalDTO;
import com.example.demo.services.EstadisticasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// todo lo nuevo de estadisticas es para cumplir con "Análisis Espacial de Desempeño", quizas se podia hacer con menos cosas, pero asi lo vi
@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class EstadisticasController {

    private final EstadisticasService service;

    public EstadisticasController(EstadisticasService service) {
        this.service = service;
    }

    @GetMapping("/correlacion-ambiental")
    public ResponseEntity<List<EstadisticaAmbientalDTO>> obtenerCorrelacionAmbiental() {
        List<EstadisticaAmbientalDTO> correlacion = service.obtenerCorrelacionClimatica();
        return ResponseEntity.ok(correlacion);
    }
}