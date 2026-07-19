package com.example.demo.controllers;

import com.example.demo.models.SectoresAmbientales;
import com.example.demo.services.SectoresAmbientalesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sectores-ambientales")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class SectoresAmbientalesController {

    private final SectoresAmbientalesService service;

    public SectoresAmbientalesController(SectoresAmbientalesService service) {
        this.service = service;
    }

    // Retorna todos los sectores ambientales
    @GetMapping
    public ResponseEntity<List<SectoresAmbientales>> obtenerTodos() {
        List<SectoresAmbientales> sectores = service.obtenerTodos();
        return ResponseEntity.ok(sectores);
    }

    // Crea un nuevo sector ambiental, la gracia es que solo lo use el admin supongo
    @PostMapping
    public ResponseEntity<?> crearSector(@RequestBody SectoresAmbientales sector) {
        try {
            service.crearSector(sector);
            return ResponseEntity.status(HttpStatus.CREATED).body("Sector ambiental creado exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar el sector en la base de datos");
        }
    }

    // Elimina un sector ambiental por su ID, tambien solo lo puede hacer el admin supongo
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarSector(@PathVariable("id") Long id) {
        try {
            int eliminados = service.eliminarSector(id);
            if (eliminados > 0) {
                return ResponseEntity.ok("Sector eliminado correctamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el sector con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el sector");
        }
    }
}
