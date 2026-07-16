package com.example.demo.controllers;

import com.example.demo.dtos.TorneoMapaDTO;
import com.example.demo.dtos.ZonaAmbientalDTO;
import com.example.demo.services.GeospatialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/mapas")
public class GeospatialController {

    private final GeospatialService geospatialService;

    public GeospatialController(GeospatialService geospatialService) {
        this.geospatialService = geospatialService;
    }

    /**
     * Devuelve el polígono y la línea de tiro de un torneo específico para renderizar en el mapa.
     * GET /api/mapas/torneos/1
     */
    @GetMapping("/torneos/{idTorneo}")
    public ResponseEntity<TorneoMapaDTO> obtenerMapaTorneo(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(geospatialService.obtenerMapaTorneo(idTorneo));
    }

    /**
     * Devuelve todos los factores climáticos activos (Vientos, lluvia) como polígonos.
     * GET /api/mapas/zonas-ambientales
     */
    @GetMapping("/zonas-ambientales")
    public ResponseEntity<List<ZonaAmbientalDTO>> obtenerZonasAmbientales() {
        List<ZonaAmbientalDTO> zonas = geospatialService.obtenerZonasAmbientales();
        if (zonas.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(zonas);
    }
}