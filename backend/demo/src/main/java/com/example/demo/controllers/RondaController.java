package com.example.demo.controllers;

import com.example.demo.models.Ronda;
import com.example.demo.services.RondaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/rondas")
public class RondaController {

	private final RondaService rondaService;

	public RondaController(RondaService rondaService) {
		this.rondaService = rondaService;
	}

	// Lista las rondas de un torneo
	@GetMapping("/torneo/{idTorneo}")
	public ResponseEntity<List<Ronda>> obtenerPorTorneo(@PathVariable Long idTorneo) {
		List<Ronda> rondas = rondaService.obtenerPorTorneo(idTorneo);
		if (rondas.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		}
		return ResponseEntity.ok(rondas);
	}

	// Crea una ronda para un torneo especifico
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

    // Lista TODAS las rondas de la base de datos
    @GetMapping
    public ResponseEntity<List<Ronda>> obtenerTodas() {
        List<Ronda> rondas = rondaService.obtenerTodas();
        return rondas.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(rondas);
    }

}
