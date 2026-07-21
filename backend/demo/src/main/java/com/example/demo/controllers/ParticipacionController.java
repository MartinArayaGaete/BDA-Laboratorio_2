package com.example.demo.controllers;

import com.example.demo.dtos.InscripcionRequestDTO;
import com.example.demo.dtos.InscritoDTO;
import com.example.demo.dtos.TorneoCompletoDTO;
import com.example.demo.services.ParticipacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/participaciones")
public class ParticipacionController {

    private final ParticipacionService participacionService;

    public ParticipacionController(ParticipacionService participacionService) {
        this.participacionService = participacionService;
    }

    @PostMapping("/inscribir")
    public ResponseEntity<String> inscribirArquero(@RequestBody InscripcionRequestDTO request) {
        try {
            participacionService.inscribirUsuario(
                    request.getIdUsuario(),
                    request.getIdTorneo()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body("Arquero inscrito exitosamente");
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
    }

    @DeleteMapping("/desinscribir")
    public ResponseEntity<String> desinscribirArquero(
            @RequestParam Long idTorneo,
            @RequestParam Long idUsuario) {
        try {
            participacionService.desinscribirUsuario(idUsuario, idTorneo);
            return ResponseEntity.ok("Arquero desinscrito exitosamente");
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
    }

    @GetMapping("/torneo/{idTorneo}")
    public ResponseEntity<List<InscritoDTO>> obtenerInscritosPorTorneo(@PathVariable Long idTorneo) {
        List<InscritoDTO> inscritos = participacionService.obtenerInscritosPorTorneo(idTorneo);
        if (inscritos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(inscritos);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerTodas() {
        List<Map<String, Object>> participaciones = participacionService.obtenerTodas();
        return participaciones.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(participaciones);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Map<String, Object>>> obtenerTorneosInscritos(@PathVariable Long idUsuario) {
        List<Map<String, Object>> torneos = participacionService.obtenerTorneosInscritos(idUsuario);
        if (torneos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(torneos);
    }

    @GetMapping("/torneo/{idTorneo}/completo")
    public ResponseEntity<TorneoCompletoDTO> obtenerDatosCompletosTorneo(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(participacionService.obtenerDatosCompletosTorneo(idTorneo));
    }
}