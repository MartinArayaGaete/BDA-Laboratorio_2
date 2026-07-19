package com.example.demo.controllers;

import com.example.demo.models.CategoriaAmbiental;
import com.example.demo.services.CategoriaAmbientalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-ambientales")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CategoriaAmbientalController {

    private final CategoriaAmbientalService service;

    public CategoriaAmbientalController(CategoriaAmbientalService service) {
        this.service = service;
    }

    // lista de categorías
    @GetMapping
    public ResponseEntity<List<CategoriaAmbiental>> listarCategorias() {
        List<CategoriaAmbiental> categorias = service.obtenerTodas();
        return ResponseEntity.ok(categorias);
    }

    // crear una nueva categoría ambiental
    @PostMapping
    public ResponseEntity<String> crearCategoria(@RequestBody CategoriaAmbiental categoria) {
        try {
            service.crearCategoria(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body("Categoría ambiental creada con éxito");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar la categoría");
        }
    }

    // borrar una categoría ambiental por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarCategoria(@PathVariable Long id) {
        try {
            int eliminados = service.eliminarCategoria(id);
            if (eliminados > 0) {
                return ResponseEntity.ok("Categoría eliminada correctamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Categoría no encontrada");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la categoría. Puede que esté en uso en un sector.");
        }
    }
}