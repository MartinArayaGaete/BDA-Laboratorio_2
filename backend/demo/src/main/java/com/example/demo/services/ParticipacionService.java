package com.example.demo.services;

import com.example.demo.dtos.ArqueroPosicionDTO;
import com.example.demo.dtos.InscritoDTO;
import com.example.demo.dtos.ResumenTorneoArqueroDTO;
import com.example.demo.dtos.TorneoCompletoDTO;
import com.example.demo.models.Torneo;
import com.example.demo.repositories.ParticipacionRepository;
import com.example.demo.repositories.TorneoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ParticipacionService {

    private final ParticipacionRepository participacionRepository;
    private final TorneoRepository torneoRepository;

    public ParticipacionService(ParticipacionRepository participacionRepository, TorneoRepository torneoRepository) {
        this.participacionRepository = participacionRepository;
        this.torneoRepository = torneoRepository;
    }

    @Transactional
    public void inscribirUsuario(Long idUsuario, Long idTorneo) {
        Torneo torneo = torneoRepository.buscarPorId(idTorneo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado"));

        if (!"NOT_STARTED".equals(torneo.getEstadoTorneo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Las inscripciones están cerradas. El torneo ya está en curso o finalizado.");
        }

        if (participacionRepository.existeParticipacion(idUsuario, idTorneo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El arquero ya está inscrito en este torneo");
        }

        if (torneo.getNroPlazaActual() >= torneo.getNroPlazaMax()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No hay plazas disponibles. Máximo: " + torneo.getNroPlazaMax());
        }

        int updated = torneoRepository.incrementarPlazaActual(idTorneo);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se pudo reservar la plaza");
        }

        participacionRepository.inscribirUsuario(idUsuario, idTorneo);
    }

    @Transactional
    public void desinscribirUsuario(Long idUsuario, Long idTorneo) {
        Torneo torneo = torneoRepository.buscarPorId(idTorneo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado"));

        if (!"NOT_STARTED".equals(torneo.getEstadoTorneo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No se puede desinscribir: el torneo ya inició o finalizó.");
        }

        if (!participacionRepository.existeParticipacion(idUsuario, idTorneo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "El arquero no está inscrito en este torneo.");
        }

        if (participacionRepository.tieneFlechasRegistradasEnTorneo(idUsuario, idTorneo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede desinscribir: el arquero ya tiene flechas registradas en este torneo.");
        }

        participacionRepository.desinscribirUsuario(idUsuario, idTorneo);
        torneoRepository.decrementarPlazaActual(idTorneo);
    }

    public List<InscritoDTO> obtenerInscritosPorTorneo(Long idTorneo) {
        return participacionRepository.obtenerInscritosPorTorneo(idTorneo);
    }

    public Long obtenerIdParticipacion(Long idUsuario, Long idTorneo) {
        return participacionRepository.obtenerIdParticipacion(idUsuario, idTorneo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No se encontró una participación para este usuario en este torneo."));
    }

    @Transactional
    public void editarPuntajeManual(Long idAdmin, Long idRondaAfectada, Long idUsuario, Long idTorneo, Integer nuevoPuntaje) {
        participacionRepository.actualizarPuntajeFinalConTrigger(idAdmin, idRondaAfectada, nuevoPuntaje, idUsuario, idTorneo);
    }

    public List<Map<String, Object>> obtenerTodas() {
        return participacionRepository.obtenerTodas();
    }

    public ResumenTorneoArqueroDTO obtenerResumenPorTorneoYUsuario(Long idTorneo, Long idUsuario) {
        Map<String, Object> resumen = participacionRepository.obtenerResumenPorTorneoYUsuario(idTorneo, idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No se encontró participación para el usuario en este torneo."));

        Integer puntajeFinal = resumen.get("puntaje_final") == null
                ? 0
                : ((Number) resumen.get("puntaje_final")).intValue();

        Integer posicionFinal = resumen.get("posicion_final") == null
                ? null
                : ((Number) resumen.get("posicion_final")).intValue();

        Integer totalFlechas = resumen.get("total_flechas") == null
                ? 0
                : ((Number) resumen.get("total_flechas")).intValue();

        Double promedioPuntos = resumen.get("promedio_puntos") == null
                ? 0.0
                : ((Number) resumen.get("promedio_puntos")).doubleValue();

        Integer rondasJugadas = resumen.get("rondas_jugadas") == null
                ? 0
                : ((Number) resumen.get("rondas_jugadas")).intValue();

        String factoresAmbientales = resumen.get("factores_ambientales") == null
                ? "Sin datos ambientales"
                : (String) resumen.get("factores_ambientales");

        return new ResumenTorneoArqueroDTO(
                puntajeFinal,
                posicionFinal,
                totalFlechas,
                promedioPuntos,
                rondasJugadas,
                factoresAmbientales
        );
    }

    public List<Map<String, Object>> obtenerTorneosInscritos(Long idUsuario) {
        return participacionRepository.obtenerTorneosInscritosPorUsuario(idUsuario);
    }

    public TorneoCompletoDTO obtenerDatosCompletosTorneo(Long idTorneo) {
        Torneo torneo = torneoRepository.buscarPorId(idTorneo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado"));

        List<Map<String, Object>> arquerosData = participacionRepository.obtenerArquerosConPosiciones(idTorneo);

        List<ArqueroPosicionDTO> arqueros = new ArrayList<>();
        for (Map<String, Object> row : arquerosData) {
            ArqueroPosicionDTO dto = new ArqueroPosicionDTO();
            dto.setIdParticipacion(((Number) row.get("id_participacion")).longValue());
            dto.setIdUsuario(((Number) row.get("id_usuario")).longValue());
            dto.setNombre((String) row.get("nombre"));
            dto.setRut((String) row.get("rut"));
            dto.setUbicacionArquero((String) row.get("ubicacion_arquero"));
            dto.setUbicacionBlanco((String) row.get("ubicacion_blanco"));
            arqueros.add(dto);
        }

        TorneoCompletoDTO dto = new TorneoCompletoDTO();
        dto.setIdTorneo(torneo.getIdTorneo());
        dto.setNombreTorneo(torneo.getNombreTorneo());
        dto.setEstadoTorneo(torneo.getEstadoTorneo());
        dto.setGeomZonaCompetencia(torneo.getGeomZonaCompetencia());
        dto.setLineaTiro(torneo.getLineaTiro());
        dto.setArqueros(arqueros);

        return dto;
    }
}
