package com.example.demo.services;

import com.example.demo.models.SectoresAmbientales;
import com.example.demo.repositories.SectoresAmbientalesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectoresAmbientalesService {

    private final SectoresAmbientalesRepository repository;

    public SectoresAmbientalesService(SectoresAmbientalesRepository repository) {
        this.repository = repository;
    }

    // Retorna todos los sectores ambientales
    public List<SectoresAmbientales> obtenerTodos() {
        return repository.obtenerTodos();
    }

    // Crea un nuevo sector ambiental validando datos obligatorios
    public int crearSector(SectoresAmbientales sector) {
        if (sector.getTerritorio() == null || sector.getTerritorio().trim().isEmpty()) {
            throw new IllegalArgumentException("El territorio geográfico es obligatorio.");
        }
        if (sector.getIdCategoriaAmbiental() == null) {
            throw new IllegalArgumentException("La categoría ambiental es obligatoria.");
        }
        
        return repository.crearSector(sector);
    }

    // Elimina un sector ambiental por su id
    public int eliminarSector(Long idZonaAmbiental) {
        return repository.eliminarSector(idZonaAmbiental);
    }
}