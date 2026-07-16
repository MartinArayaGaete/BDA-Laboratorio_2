package com.example.demo.controllers;

import com.example.demo.dtos.EstadisticasArqueroDTO;
import com.example.demo.dtos.HistorialArqueroResponse;
import com.example.demo.dtos.LeaderboardDTO;
import com.example.demo.services.FlechaService;
import com.example.demo.services.HistorialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/arqueros")
public class ArquerosController {

    private final HistorialService historialService;
    private final FlechaService flechaService;

    // Actualiza el constructor para inicializar ambos campos
    public ArquerosController(HistorialService historialService, FlechaService flechaService) {
        this.historialService = historialService;
        this.flechaService = flechaService;
    }

    /**
     * Obtiene el historial paginado de un arquero...
     */
    @GetMapping("/{idUsuario}/historial")
    public ResponseEntity<HistorialArqueroResponse> obtenerHistorial(
            @PathVariable Long idUsuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            HistorialArqueroResponse respuesta = historialService.obtenerHistorialArquero(idUsuario, page, size);
            return ResponseEntity.ok(respuesta);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene estadisticas agregadas del arquero.
     * GET /api/arqueros/{idUsuario}/estadisticas
     */
    @GetMapping("/{idUsuario}/estadisticas")
    public ResponseEntity<EstadisticasArqueroDTO> obtenerEstadisticas(@PathVariable Long idUsuario) {
        try {
            return ResponseEntity.ok(historialService.obtenerEstadisticasArquero(idUsuario));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para el Requisito 9: Mejores del último mes
     */
    @GetMapping("/rendimiento/ultimo-mes")
    public ResponseEntity<List<LeaderboardDTO>> obtenerMejoresUltimoMes() {
        List<LeaderboardDTO> lista = flechaService.obtenerMejoresDelMes();
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }
}