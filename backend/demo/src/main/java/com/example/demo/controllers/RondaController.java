package com.example.demo.controllers;

import com.example.demo.models.Ronda;
import com.example.demo.services.RondaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/rondas")
public class RondaController {

    private final RondaService rondaService;

    public RondaController(RondaService rondaService) {
        this.rondaService = rondaService;
    }

    @GetMapping("/torneo/{idTorneo}")
    public ResponseEntity<List<Ronda>> obtenerPorTorneo(@PathVariable Long idTorneo) {
        List<Ronda> rondas = rondaService.obtenerPorTorneo(idTorneo);
        if (rondas.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(rondas);
    }

    @PostMapping
    public ResponseEntity<String> crearRonda(@RequestBody Ronda ronda) {
        try {
            rondaService.crearRonda(ronda.getIdTorneo(), ronda.getNumeroRonda());
            return ResponseEntity.status(HttpStatus.CREATED).body("Ronda creada exitosamente");
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    @GetMapping("/participacion/{idParticipacion}/ronda/{idRonda}/puntaje")
    public ResponseEntity<Integer> verPuntajeRonda(
            @PathVariable Long idParticipacion,
            @PathVariable Long idRonda) {
        return ResponseEntity.ok(rondaService.verPuntajeRonda(idParticipacion, idRonda));
    }

    @GetMapping
    public ResponseEntity<List<Ronda>> obtenerTodas() {
        List<Ronda> rondas = rondaService.obtenerTodas();
        return rondas.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(rondas);
    }

    @PutMapping("/{idRonda}/zona-ambiental")
    public ResponseEntity<String> asignarZonaAmbiental(
            @PathVariable Long idRonda,
            @RequestBody Map<String, Long> body) {
        try {
            Long idZonaAmbiental = body.get("idZonaAmbiental");
            rondaService.asignarZonaAmbiental(idRonda, idZonaAmbiental);
            return ResponseEntity.ok("Zona ambiental asignada a la ronda");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @DeleteMapping("/{idRonda}")
    public ResponseEntity<String> eliminarRonda(@PathVariable Long idRonda) {
        try {
            rondaService.eliminarRonda(idRonda);
            return ResponseEntity.ok("Ronda eliminada exitosamente");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al eliminar la ronda");
        }
    }
}