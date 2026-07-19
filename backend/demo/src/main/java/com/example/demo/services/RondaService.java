package com.example.demo.services;

import com.example.demo.models.Ronda;
import com.example.demo.repositories.RondaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RondaService {

    private final RondaRepository rondaRepository;

    public RondaService(RondaRepository rondaRepository) {
        this.rondaRepository = rondaRepository;
    }

    public List<Ronda> obtenerPorTorneo(Long idTorneo) {
        return rondaRepository.buscarPorTorneo(idTorneo);
    }

    public void crearRonda(Long idTorneo, Integer numeroRonda) {
        if (idTorneo == null || numeroRonda == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "idTorneo y numeroRonda son obligatorios");
        }
        if (rondaRepository.existeRonda(idTorneo, numeroRonda)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esa ronda ya existe en este torneo");
        }
        rondaRepository.crearRonda(idTorneo, numeroRonda);
    }

    public Integer verPuntajeRonda(Long idParticipacion, Long idRonda) {
        return rondaRepository.obtenerPuntajeCalculadoRonda(idParticipacion, idRonda);
    }

    public List<Ronda> obtenerTodas() {
        return rondaRepository.obtenerTodas();
    }

    public void asignarZonaAmbiental(Long idRonda, Long idZonaAmbiental) {
        int updated = rondaRepository.asignarZonaAmbiental(idRonda, idZonaAmbiental);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ronda no encontrada");
        }
    }
}