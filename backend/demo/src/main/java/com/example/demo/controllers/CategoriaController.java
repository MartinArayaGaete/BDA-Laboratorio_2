package com.example.demo.controllers;

import com.example.demo.models.Categoria;
import com.example.demo.services.CategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // Recupera la lista completa de categorias
    @GetMapping
    public ResponseEntity<List<Categoria>> obtenerTodas() {
        List<Categoria> categorias = categoriaService.obtenerTodas();
        if (categorias.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(categorias);
    }

    // Obtiene una categoria especifica por su id
    @GetMapping("/{idCategoria}")
    public ResponseEntity<Categoria> obtenerPorId(@PathVariable Long idCategoria) {
        Optional<Categoria> categoria = categoriaService.buscarPorId(idCategoria);
        return categoria.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Crea una nueva categoria
    @PostMapping
    public ResponseEntity<String> crearCategoria(@RequestBody Categoria categoria) {
        categoriaService.crearCategoria(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body("Categoria creada exitosamente");
    }

    // Actualiza una categoria existente
    @PutMapping("/{idCategoria}")
    public ResponseEntity<String> actualizarCategoria(@PathVariable Long idCategoria, @RequestBody Categoria categoria) {
        try {
            categoriaService.actualizarCategoria(idCategoria, categoria);
            return ResponseEntity.ok("Categoria actualizada exitosamente");
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    // Elimina una categoria por su id
    @DeleteMapping("/{idCategoria}")
    public ResponseEntity<String> eliminarCategoria(@PathVariable Long idCategoria) {
        try {
            categoriaService.eliminarPorId(idCategoria);
            return ResponseEntity.ok("Categoria eliminada exitosamente");
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }
}
