package com.example.demo.services;

import com.example.demo.dtos.HistorialArqueroResponse;
import com.example.demo.dtos.EstadisticasArqueroDTO;
import com.example.demo.dtos.HistorialFlechaDTO;
import com.example.demo.dtos.HistorialRondaDTO;
import com.example.demo.dtos.HistorialTorneoDTO;
import com.example.demo.repositories.FlechaRepository;
import com.example.demo.repositories.ParticipacionRepository;
import com.example.demo.repositories.RondaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.sql.Date;
import java.util.*;

@Service
public class HistorialService {

    private final ParticipacionRepository participacionRepository;
    private final RondaRepository rondaRepository;
    private final FlechaRepository flechaRepository;

    public HistorialService(ParticipacionRepository participacionRepository,
                           RondaRepository rondaRepository,
                           FlechaRepository flechaRepository) {
        this.participacionRepository = participacionRepository;
        this.rondaRepository = rondaRepository;
        this.flechaRepository = flechaRepository;
    }

    /**
     * Obtiene el historial de participaciones de un arquero de forma paginada.
     * Incluye todos los torneos, rondas y flechas de cada participación.
     */
    public HistorialArqueroResponse obtenerHistorialArquero(Long idUsuario, int page, int size) {
        // Validar parámetros de paginación
        if (page < 0 || size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los parámetros de paginación son inválidos");
        }

        // Obtener total de participaciones del usuario
        Long totalElements = participacionRepository.contarParticipacionesPorUsuario(idUsuario);

        // Si no tiene ninguna participación
        if (totalElements == 0) {
            return new HistorialArqueroResponse(
                    Collections.emptyList(),
                    page,
                    size,
                    0L,
                    0
            );
        }

        // Calcular total de páginas
        Integer totalPages = (int) Math.ceil((double) totalElements / size);

        // Validar que la página solicitada existe
        if (page >= totalPages) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La página solicitada no existe. Máximo: " + (totalPages - 1));
        }

        // Obtener participaciones paginadas con datos del torneo
        List<Map<String, Object>> participacionesData = participacionRepository.obtenerHistorialPaginado(idUsuario, page, size);

        // Armar la estructura de torneos con rondas y flechas
        List<HistorialTorneoDTO> torneos = new ArrayList<>();

        // Preparar batching: obtener todas las flechas para las participaciones en página
        List<Long> idsParticipacion = new ArrayList<>();
        for (Map<String, Object> p : participacionesData) {
            Long idPart = asLong(p.get("id_participacion"));
            if (idPart != null) idsParticipacion.add(idPart);
        }

        List<Map<String, Object>> flechasBatch = flechaRepository.obtenerFlechasPorParticipaciones(idsParticipacion);

        // Organizar flechas por id_participacion -> numero_ronda -> list de flechas
        Map<Long, Map<Integer, List<Map<String, Object>>>> flechasPorParticipacion = new HashMap<>();
        for (Map<String, Object> f : flechasBatch) {
            Long idPart = asLong(f.get("id_participacion"));
            Integer numeroRonda = asInteger(f.get("numero_ronda"));
            if (idPart == null || numeroRonda == null) continue;
            flechasPorParticipacion.computeIfAbsent(idPart, k -> new HashMap<>())
                    .computeIfAbsent(numeroRonda, k -> new ArrayList<>())
                    .add(f);
        }

        for (Map<String, Object> participacion : participacionesData) {
            Long idParticipacion = asLong(participacion.get("id_participacion"));
            Long idTorneo = asLong(participacion.get("id_torneo"));
            String nombreTorneo = asString(participacion.get("nombre_torneo"));
            Integer puntajeFinal = asInteger(participacion.get("puntaje_final"));
            Integer posicionFinal = asInteger(participacion.get("posicion_final"));
            LocalDate fechaInicio = asLocalDate(participacion.get("fecha_inicio"));
            String estadoTorneo = asString(participacion.get("estado_torneo"));

            // Obtener rondas con puntajes para esta participación
            List<Map<String, Object>> rondasData = rondaRepository.obtenerRondasConPuntajesPorParticipacion(idParticipacion, idTorneo);

            // Armar la estructura de rondas con flechas
            List<HistorialRondaDTO> rondas = new ArrayList<>();
            for (Map<String, Object> ronda : rondasData) {
                Integer numeroRonda = asInteger(ronda.get("numero_ronda"));
                Integer puntajeRonda = asInteger(ronda.get("puntaje_ronda"));

                // Obtener flechas de esta ronda desde el batch (si existen)
                List<Map<String, Object>> flechasData = new ArrayList<>();
                if (idParticipacion != null) {
                    Map<Integer, List<Map<String, Object>>> porRonda = flechasPorParticipacion.get(idParticipacion);
                    if (porRonda != null && porRonda.get(numeroRonda) != null) {
                        flechasData = porRonda.get(numeroRonda);
                    }
                }

                // Armar la estructura de flechas
                List<HistorialFlechaDTO> flechas = new ArrayList<>();
                for (Map<String, Object> flecha : flechasData) {
                    Long idFlecha = asLong(flecha.get("id_flecha"));
                    Integer puntajeFlecha = asInteger(flecha.get("puntaje"));

                    flechas.add(new HistorialFlechaDTO(idFlecha, puntajeFlecha));
                }

                HistorialRondaDTO rondaDTO = new HistorialRondaDTO(numeroRonda, puntajeRonda, flechas);
                rondas.add(rondaDTO);
            }

            HistorialTorneoDTO torneoDTO = new HistorialTorneoDTO(
                    idTorneo,
                    nombreTorneo,
                    puntajeFinal,
                    posicionFinal,
                    fechaInicio,
                    estadoTorneo,
                    rondas
            );
            torneos.add(torneoDTO);
        }

        return new HistorialArqueroResponse(
                torneos,
                page,
                size,
                totalElements,
                totalPages
        );
    }

    public EstadisticasArqueroDTO obtenerEstadisticasArquero(Long idUsuario) {
        Map<String, Object> stats = participacionRepository.obtenerEstadisticasArquero(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontraron participaciones para el usuario"));

        Integer torneosTotales = asInteger(stats.get("torneos_totales"));
        Integer totalFlechas = asInteger(stats.get("total_flechas"));
        Integer flechasAcertadas = asInteger(stats.get("flechas_acertadas"));
        Integer totalPuntos = asInteger(stats.get("total_puntos"));
        Double promedioPuntos = asDouble(stats.get("promedio_puntos"));
        Integer porcentajeAcierto = totalFlechas > 0
                ? (int) Math.round((flechasAcertadas * 100.0) / totalFlechas)
                : 0;

        return new EstadisticasArqueroDTO(
                torneosTotales,
                totalFlechas,
                flechasAcertadas,
                porcentajeAcierto,
                totalPuntos,
                promedioPuntos
        );
    }

    private Long asLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }

    private Integer asInteger(Object value) {
        return value == null ? null : ((Number) value).intValue();
    }

    private Double asDouble(Object value) {
        return value == null ? null : ((Number) value).doubleValue();
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private LocalDate asLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }
}
