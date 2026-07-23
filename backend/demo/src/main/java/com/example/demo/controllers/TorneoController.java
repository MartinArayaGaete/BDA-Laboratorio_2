package com.example.demo.controllers;

import com.example.demo.dtos.InscritoDTO;
import com.example.demo.dtos.TorneoCreacionDTO;
import com.example.demo.dtos.FlechaArqueroDTO;
import com.example.demo.dtos.PuntajeRondaDTO;
import com.example.demo.dtos.ResumenTorneoArqueroDTO;
import com.example.demo.dtos.TorneosDisponiblesResponse;
import com.example.demo.models.Torneo;
import com.example.demo.repositories.RondaRepository;
import com.example.demo.services.TorneoService;
import com.example.demo.services.FlechaService;
import com.example.demo.services.TorneosDisponiblesService;
import com.example.demo.services.ParticipacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/torneos")
public class TorneoController {

    private final TorneoService torneoService;
    private final FlechaService flechaService;
    private final TorneosDisponiblesService torneosDisponiblesService;
    private final ParticipacionService participacionService;
    private final RondaRepository rondaRepository;

    public TorneoController(TorneoService torneoService,
                            FlechaService flechaService,
                            TorneosDisponiblesService torneosDisponiblesService,
                            ParticipacionService participacionService,
                            RondaRepository rondaRepository) {
        this.torneoService = torneoService;
        this.flechaService = flechaService;
        this.torneosDisponiblesService = torneosDisponiblesService;
        this.participacionService = participacionService;
        this.rondaRepository = rondaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Torneo>> obtenerTodos() {
        return ResponseEntity.ok(torneoService.obtenerTodos());
    }

    @GetMapping("/{idTorneo}")
    public ResponseEntity<Torneo> obtenerTorneo(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(torneoService.obtenerTorneo(idTorneo));
    }

    @GetMapping("/paginados")
    public ResponseEntity<com.example.demo.dtos.TorneosPaginadosResponse> obtenerTorneosPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(torneoService.obtenerTorneosPaginados(page, size));
    }

    @GetMapping("/paginados/estado/{estado}")
    public ResponseEntity<com.example.demo.dtos.TorneosPaginadosResponse> obtenerTorneosPorEstadoPaginados(
            @PathVariable String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(torneoService.obtenerTorneosPorEstadoPaginados(estado, page, size));
    }

    @PostMapping
    public ResponseEntity<String> crearTorneo(@RequestBody TorneoCreacionDTO dto) {
        torneoService.crearTorneo(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Torneo creado exitosamente");
    }

    @GetMapping("/{idTorneo}/arqueros/{idUsuario}/flechas")
    public ResponseEntity<List<FlechaArqueroDTO>> verFlechasDeArquero(@PathVariable Long idTorneo, @PathVariable Long idUsuario) {
        return ResponseEntity.ok(flechaService.obtenerFlechasArquero(idUsuario, idTorneo));
    }

    @GetMapping("/{idTorneo}/rondas/{numeroRonda}/arqueros/{idUsuario}/flechas")
    public ResponseEntity<List<FlechaArqueroDTO>> verFlechasDeArqueroPorRonda(
            @PathVariable Long idTorneo,
            @PathVariable Integer numeroRonda,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(flechaService.obtenerFlechasArqueroEnRonda(idUsuario, idTorneo, numeroRonda));
    }

    @GetMapping("/{idTorneo}/arqueros/{idUsuario}/resumen")
    public ResponseEntity<ResumenTorneoArqueroDTO> obtenerResumenArqueroEnTorneo(
            @PathVariable Long idTorneo,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(participacionService.obtenerResumenPorTorneoYUsuario(idTorneo, idUsuario));
    }

    @PostMapping("/{idTorneo}/rondas/{numeroRonda}")
    public ResponseEntity<String> crearRondaManual(@PathVariable Long idTorneo, @PathVariable Integer numeroRonda) {
        torneoService.agregarRondaManual(idTorneo, numeroRonda);
        return ResponseEntity.status(HttpStatus.CREATED).body("Ronda " + numeroRonda + " creada con éxito");
    }

    @PostMapping("/{idTorneo}/arqueros/{idUsuario}/rondas/{numeroRonda}/flechas")
    public ResponseEntity<String> registrarRondaCompleta(
            @PathVariable Long idTorneo,
            @PathVariable Long idUsuario,
            @PathVariable Integer numeroRonda,
            @RequestBody Map<String, Object> body) {

        @SuppressWarnings("unchecked")
        List<Integer> flechas = (List<Integer>) body.get("flechas");

        String posicionArquero = body.get("posicionArquero") != null ? body.get("posicionArquero").toString() : null;
        String posicionDiana = body.get("posicionDiana") != null ? body.get("posicionDiana").toString() : null;

        Long idParticipacion = participacionService.obtenerIdParticipacion(idUsuario, idTorneo);
        Long idRonda = rondaRepository.obtenerIdRonda(idTorneo, numeroRonda)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ronda no encontrada"));

        PuntajeRondaDTO dto = new PuntajeRondaDTO();
        dto.setIdRonda(idRonda);
        dto.setIdParticipacion(idParticipacion);
        dto.setIdAdmin(1L);
        dto.setFlechas(flechas);
        dto.setPosicionArquero(posicionArquero);
        dto.setPosicionDiana(posicionDiana);

        flechaService.registrarRondaCompletaDTO(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body("Ronda registrada con éxito");
    }

    @PostMapping("/{idTorneo}/finalizar")
    public ResponseEntity<String> finalizarTorneo(@PathVariable Long idTorneo) {
        torneoService.finalizarTorneo(idTorneo);
        return ResponseEntity.ok("Torneo finalizado y posiciones calculadas con éxito mediante SP.");
    }

    @GetMapping("/{idTorneo}/podio")
    public ResponseEntity<List<InscritoDTO>> obtenerPodio(@PathVariable Long idTorneo) {
        return ResponseEntity.ok(torneoService.obtenerPodio(idTorneo));
    }

    @PostMapping("/registrar-puntaje")
    public ResponseEntity<?> registrarPuntajeRonda(@RequestBody PuntajeRondaDTO request) {
        try {
            flechaService.registrarRondaCompletaDTO(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Puntaje registrado");
        } catch (ResponseStatusException exception) {
            String message = exception.getReason() == null
                    ? "No se pudo registrar el puntaje."
                    : exception.getReason();
            return ResponseEntity.status(exception.getStatusCode())
                    .body(Map.of("message", message));
        }
    }

    @PostMapping("/{idTorneo}/iniciar")
    public ResponseEntity<String> iniciarTorneo(@PathVariable Long idTorneo) {
        try {
            torneoService.iniciarTorneo(idTorneo);
            return ResponseEntity.ok("Torneo iniciado con éxito. Ya no se aceptan nuevos inscritos.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al iniciar el torneo.");
        }
    }

    @GetMapping("/disponibles")
    public ResponseEntity<TorneosDisponiblesResponse> obtenerTorneosDisponibles(
            @RequestParam Long idUsuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        try {
            TorneosDisponiblesResponse respuesta = torneosDisponiblesService.obtenerTorneosDisponibles(idUsuario, page, size);
            return ResponseEntity.ok(respuesta);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<com.example.demo.dtos.LeaderboardDTO>> obtenerLeaderboard() {
        return ResponseEntity.ok(flechaService.obtenerLeaderboard());
    }

    @GetMapping("/{id}/climas")
    public ResponseEntity<List<Map<String, Object>>> obtenerClimasDeTorneo(@PathVariable Long id) {
        List<Map<String, Object>> climas = torneoService.obtenerClimasPorTorneo(id);
        return ResponseEntity.ok(climas);
    }


    /**
     * Obtiene las posiciones de todos los arqueros en una ronda específica.
     * GET /api/torneos/{idTorneo}/rondas/{numeroRonda}/posiciones
     */
    @GetMapping("/{idTorneo}/rondas/{numeroRonda}/posiciones")
    public ResponseEntity<List<Map<String, Object>>> obtenerPosicionesRonda(
            @PathVariable Long idTorneo,
            @PathVariable Integer numeroRonda) {
        List<Map<String, Object>> posiciones = torneoService.obtenerPosicionesPorRonda(idTorneo, numeroRonda);
        if (posiciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(posiciones);
    }

    /**
     * Obtiene la posición de un arquero específico en una ronda.
     * GET /api/torneos/{idTorneo}/rondas/{numeroRonda}/arqueros/{idUsuario}/posicion
     */
    @GetMapping("/{idTorneo}/rondas/{numeroRonda}/arqueros/{idUsuario}/posicion")
    public ResponseEntity<Map<String, Object>> obtenerPosicionArqueroEnRonda(
            @PathVariable Long idTorneo,
            @PathVariable Integer numeroRonda,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(torneoService.obtenerPosicionArqueroEnRonda(idTorneo, numeroRonda, idUsuario));
    }



    @DeleteMapping("/{idTorneo}")
    public ResponseEntity<String> eliminarTorneo(@PathVariable Long idTorneo) {
        try {
            torneoService.eliminarTorneo(idTorneo);
            return ResponseEntity.ok("Torneo eliminado exitosamente");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al eliminar el torneo");
        }
    }

    @PutMapping("/{idTorneo}")
    public ResponseEntity<String> actualizarTorneo(@PathVariable Long idTorneo, @RequestBody TorneoCreacionDTO dto) {
        try {
            torneoService.actualizarTorneo(idTorneo, dto);
            return ResponseEntity.ok("Torneo actualizado exitosamente");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al actualizar el torneo");
        }
    }
}
