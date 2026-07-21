package com.example.demo.services;

import com.example.demo.dtos.TorneoDisponibleDTO;
import com.example.demo.dtos.TorneosDisponiblesResponse;
import com.example.demo.repositories.TorneoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class TorneosDisponiblesService {

    private final TorneoRepository torneoRepository;

    public TorneosDisponiblesService(TorneoRepository torneoRepository) {
        this.torneoRepository = torneoRepository;
    }

    public TorneosDisponiblesResponse obtenerTorneosDisponibles(Long idUsuario, int page, int size) {
        if (page < 0 || size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los parámetros de paginación son inválidos");
        }

        Long totalElements = torneoRepository.contarTorneosDisponibles(idUsuario);

        if (totalElements == 0) {
            return new TorneosDisponiblesResponse(
                    new ArrayList<>(),
                    page,
                    size,
                    0L,
                    0
            );
        }

        Integer totalPages = (int) Math.ceil((double) totalElements / size);

        if (page >= totalPages) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La página solicitada no existe. Máximo: " + (totalPages - 1));
        }

        List<Map<String, Object>> torneosData = torneoRepository.obtenerTorneosDisponiblesPaginados(idUsuario, page, size);

        List<TorneoDisponibleDTO> torneos = new ArrayList<>();
        for (Map<String, Object> torneo : torneosData) {
            Long idTorneo = asLong(torneo.get("id_torneo"));
            String nombreTorneo = asString(torneo.get("nombre_torneo"));
            String estadoTorneo = asString(torneo.get("estado_torneo"));
            LocalDate fechaInicio = asLocalDate(torneo.get("fecha_inicio"));
            LocalDate fechaTermino = asLocalDate(torneo.get("fecha_termino"));
            Long idCategoria = asLong(torneo.get("id_categoria"));
            String nombreCategoria = asString(torneo.get("nombre_categoria"));
            Integer nroPlazaMax = asInteger(torneo.get("nro_plaza_max"));
            Integer nroPlazaActual = asInteger(torneo.get("nro_plaza_actual"));
            Integer plazasDisponibles = asInteger(torneo.get("plazas_disponibles"));

            TorneoDisponibleDTO dto = new TorneoDisponibleDTO(
                    idTorneo,
                    nombreTorneo,
                    estadoTorneo,
                    fechaInicio,
                    fechaTermino,
                    idCategoria,
                    nombreCategoria,
                    nroPlazaMax,
                    nroPlazaActual,
                    plazasDisponibles
            );
            torneos.add(dto);
        }

        return new TorneosDisponiblesResponse(
                torneos,
                page,
                size,
                totalElements,
                totalPages
        );
    }

    private Long asLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }

    private Integer asInteger(Object value) {
        return value == null ? 0 : ((Number) value).intValue();
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