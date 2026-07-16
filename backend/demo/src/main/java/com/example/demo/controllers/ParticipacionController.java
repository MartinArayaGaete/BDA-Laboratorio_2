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

    // Inyectamos ParticipacionService porque ahí reside ahora la lógica limpia
    public ParticipacionController(ParticipacionService participacionService) {
        this.participacionService = participacionService;
    }

    /**
     * Inscribe a un arquero en un torneo.
     * POST /api/participaciones/inscribir?idTorneo=1&idUsuario=5
     */
    @PostMapping("/inscribir")
    public ResponseEntity<String> inscribirArquero(@RequestBody InscripcionRequestDTO request) {
        try {
            // Pasamos los 4 argumentos requeridos extrayéndolos del DTO
            participacionService.inscribirUsuario(
                    request.getIdUsuario(),
                    request.getIdTorneo(),
                    request.getUbicacionArquero(),
                    request.getUbicacionBlanco()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body("Arquero inscrito exitosamente");
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor");
        }
    }

    /**
     * Desinscribe a un arquero de un torneo.
     * DELETE /api/participaciones/desinscribir?idTorneo=1&idUsuario=5
     */
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

    /**
     * Obtiene la lista de inscritos de un torneo específico.
     * GET /api/participaciones/torneo/1
     */
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


    /**
     * Obtiene los torneos en los que un usuario está inscrito.
     * GET /api/participaciones/usuario/5
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Map<String, Object>>> obtenerTorneosInscritos(@PathVariable Long idUsuario) {
        List<Map<String, Object>> torneos = participacionService.obtenerTorneosInscritos(idUsuario);
        if (torneos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(torneos);
    }


    /**
     * Obtiene todos los datos geoespaciales de un torneo.
     * GET /api/participaciones/torneo/{idTorneo}/completo
     */
    @GetMapping("/torneo/{idTorneo}/completo")
    public ResponseEntity<TorneoCompletoDTO> obtenerDatosCompletosTorneo(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(participacionService.obtenerDatosCompletosTorneo(idTorneo));
    }


}