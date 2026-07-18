package com.example.demo.controllers;

import com.example.demo.dtos.InscritoDTO;
import com.example.demo.dtos.TorneoCreacionDTO;
import com.example.demo.dtos.FlechaArqueroDTO;
import com.example.demo.dtos.PuntajeRondaDTO;
import com.example.demo.dtos.ResumenTorneoArqueroDTO;
import com.example.demo.models.Torneo;
import com.example.demo.services.TorneoService;
import com.example.demo.services.FlechaService;
import com.example.demo.services.TorneosDisponiblesService;
import com.example.demo.services.ParticipacionService;
import com.example.demo.dtos.TorneosDisponiblesResponse;
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

    public TorneoController(TorneoService torneoService,
                            FlechaService flechaService,
                            TorneosDisponiblesService torneosDisponiblesService,
                            ParticipacionService participacionService) {
        this.torneoService = torneoService;
        this.flechaService = flechaService;
        this.torneosDisponiblesService = torneosDisponiblesService;
        this.participacionService = participacionService;
    }

    @GetMapping
    public ResponseEntity<List<Torneo>> obtenerTodos() {
        return ResponseEntity.ok(torneoService.obtenerTodos());
    }

    /**
     * Obtiene torneos paginados.
     * GET /api/torneos/paginados?page=0&size=6
     */
    @GetMapping("/paginados")
    public ResponseEntity<com.example.demo.dtos.TorneosPaginadosResponse> obtenerTorneosPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(torneoService.obtenerTorneosPaginados(page, size));
    }

    /**
     * Obtiene torneos paginados filtrando por estado.
     * GET /api/torneos/paginados/estado/ON_COURSE?page=0&size=6
     */
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

    /**
     * Obtiene las flechas de un arquero en una ronda específica de un torneo.
     * GET /api/torneos/{idTorneo}/rondas/{numeroRonda}/arqueros/{idUsuario}/flechas
     */
    @GetMapping("/{idTorneo}/rondas/{numeroRonda}/arqueros/{idUsuario}/flechas")
    public ResponseEntity<List<FlechaArqueroDTO>> verFlechasDeArqueroPorRonda(
            @PathVariable Long idTorneo,
            @PathVariable Integer numeroRonda,
            @PathVariable Long idUsuario) {
        return ResponseEntity.ok(flechaService.obtenerFlechasArqueroEnRonda(idUsuario, idTorneo, numeroRonda));
    }

    /**
     * Obtiene un resumen de rendimiento del arquero en un torneo.
     * GET /api/torneos/{idTorneo}/arqueros/{idUsuario}/resumen
     */
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
            @RequestBody Map<String, List<Integer>> body) {

        List<Integer> flechas = body.get("flechas");
        if (flechas == null || flechas.isEmpty()) {
            return ResponseEntity.badRequest().body("Falta enviar el arreglo 'flechas' en el JSON");
        }

        // ID temporal del administrador
        Long idAdmin = 1L;
        flechaService.registrarRondaCompleta(idTorneo, idUsuario, numeroRonda, flechas, idAdmin);

        return ResponseEntity.status(HttpStatus.CREATED).body("¡Ronda registrada con éxito mediante Procedimiento Almacenado!");
    }

    // Endpoint para finalizar el torneo y disparar el SP de ranking
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
    public ResponseEntity<String> registrarPuntajeRonda(@RequestBody PuntajeRondaDTO request) {
        flechaService.registrarRondaCompletaDTO(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Puntaje registrado");
    }

    /**
     * Inicia un torneo oficialmente, bloqueando nuevas inscripciones.
     * POST /api/torneos/{idTorneo}/iniciar
     */
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

    /**
     * Obtiene torneos disponibles de forma paginada para un usuario.
     * Los torneos disponibles son aquellos en estado NOT_STARTED donde el usuario no está inscrito.
     * GET /api/torneos/disponibles?idUsuario=1&page=0&size=6
     */
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

    /**
     * Obtiene el leaderboard histórico de arqueros basado en su promedio de puntos por flecha.
     * GET /api/torneos/leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<com.example.demo.dtos.LeaderboardDTO>> obtenerLeaderboard() {
        return ResponseEntity.ok(flechaService.obtenerLeaderboard());
    }
}