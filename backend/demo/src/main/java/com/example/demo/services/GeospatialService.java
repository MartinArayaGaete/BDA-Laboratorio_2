package com.example.demo.services;

import com.example.demo.dtos.TorneoMapaDTO;
import com.example.demo.dtos.ZonaAmbientalDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GeospatialService {

    private final JdbcTemplate jdbcTemplate;

    public GeospatialService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public TorneoMapaDTO obtenerMapaTorneo(Long idTorneo) {
        String sql = """
            SELECT id_torneo, nombre_torneo, 
                   ST_AsGeoJSON(geom_zona_competencia) as zona, 
                   ST_AsGeoJSON(linea_tiro) as linea 
            FROM torneo WHERE id_torneo = ?
            """;

        List<TorneoMapaDTO> resultados = jdbcTemplate.query(sql, (rs, rowNum) -> new TorneoMapaDTO(
                rs.getLong("id_torneo"),
                rs.getString("nombre_torneo"),
                rs.getString("zona"),
                rs.getString("linea")
        ), idTorneo);

        if (resultados.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Torneo no encontrado");
        }
        return resultados.get(0);
    }

    public List<ZonaAmbientalDTO> obtenerZonasAmbientales() {
        String sql = "SELECT id_zona, tipo, ST_AsGeoJSON(geom_area) as area FROM zona_ambiental";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ZonaAmbientalDTO(
                rs.getLong("id_zona"),
                rs.getString("tipo"),
                rs.getString("area")
        ));
    }
}