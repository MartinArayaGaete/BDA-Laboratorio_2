package com.example.demo.controllers;

import com.example.demo.dtos.TorneoMapaDTO;
import com.example.demo.dtos.ZonaAmbientalDTO;
import com.example.demo.services.GeospatialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/mapas")
public class GeospatialController {

    private final GeospatialService geospatialService;

    public GeospatialController(GeospatialService geospatialService) {
        this.geospatialService = geospatialService;
    }

    @GetMapping("/torneos/{idTorneo}")
    public ResponseEntity<TorneoMapaDTO> obtenerMapaTorneo(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(geospatialService.obtenerMapaTorneo(idTorneo));
    }

    @GetMapping("/zonas-ambientales")
    public ResponseEntity<List<ZonaAmbientalDTO>> obtenerZonasAmbientales() {
        List<ZonaAmbientalDTO> zonas = geospatialService.obtenerZonasAmbientales();
        if (zonas.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(zonas);
    }

    @GetMapping("/categorias-por-coordenada")
    public ResponseEntity<List<Map<String, Object>>> obtenerCategoriasPorCoordenada(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        List<Map<String, Object>> categorias = geospatialService.obtenerCategoriasPorPunto(lat, lng);
        if (categorias.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(categorias);
    }
}