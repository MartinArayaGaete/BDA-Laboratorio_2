package com.example.demo.services;

import com.example.demo.models.Ronda;
import com.example.demo.models.Torneo;
import com.example.demo.repositories.RondaRepository;
import com.example.demo.repositories.TorneoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RondaService {

    private final RondaRepository rondaRepository;
    private final TorneoRepository torneoRepository;

    public RondaService(RondaRepository rondaRepository, TorneoRepository torneoRepository) {
        this.rondaRepository = rondaRepository;
        this.torneoRepository = torneoRepository;
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

    @Transactional
    public void eliminarRonda(Long idRonda) {
        Ronda ronda = rondaRepository.buscarPorId(idRonda)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ronda no encontrada"));

        Torneo torneo = torneoRepository.buscarPorId(ronda.getIdTorneo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado"));

        if (!"NOT_STARTED".equals(torneo.getEstadoTorneo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No se puede eliminar la ronda. El torneo ya inició o finalizó.");
        }

        int deleted = rondaRepository.eliminarRonda(idRonda);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No se pudo eliminar la ronda. Verifica que el torneo no haya iniciado.");
        }
    }
}