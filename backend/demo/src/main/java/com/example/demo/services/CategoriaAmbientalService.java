package com.example.demo.services;

import com.example.demo.models.CategoriaAmbiental;
import com.example.demo.repositories.CategoriaAmbientalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaAmbientalService {

    private final CategoriaAmbientalRepository repository;

    public CategoriaAmbientalService(CategoriaAmbientalRepository repository) {
        this.repository = repository;
    }

    public List<CategoriaAmbiental> obtenerTodas() {
        return repository.obtenerTodas();
    }

    public int crearCategoria(CategoriaAmbiental categoria) {
        if (categoria.getCategoriaAmbiental() == null || categoria.getCategoriaAmbiental().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría ambiental no puede estar vacío");
        }
        return repository.crearCategoria(categoria);
    }

    public int eliminarCategoria(Long idCategoria) {
        return repository.eliminarCategoria(idCategoria);
    }
}