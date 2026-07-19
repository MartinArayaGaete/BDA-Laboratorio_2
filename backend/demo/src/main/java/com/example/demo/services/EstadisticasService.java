package com.example.demo.services;

import com.example.demo.dtos.EstadisticaAmbientalDTO;
import com.example.demo.repositories.EstadisticasRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstadisticasService {

    private final EstadisticasRepository repository;

    public EstadisticasService(EstadisticasRepository repository) {
        this.repository = repository;
    }

    public List<EstadisticaAmbientalDTO> obtenerCorrelacionClimatica() {
        return repository.obtenerCorrelacionClimatica();
    }
}