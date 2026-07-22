package com.example.demo.services;

import com.example.demo.dtos.TorneoMapaDTO;
import com.example.demo.dtos.ZonaAmbientalDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class GeospatialService {

    private final JdbcTemplate jdbcTemplate;

    public GeospatialService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public TorneoMapaDTO obtenerMapaTorneo(Long idTorneo) {
        String sql = """
            SELECT id_torneo, nombre_torneo, 
                   ST_AsGeoJSON(espacio_torneo) as zona, 
                   ST_AsGeoJSON(linea_de_tiro) as linea 
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
        String sql = """
            SELECT sa.id_zona_ambiental, ca.categoria_ambiental, 
                   ST_AsGeoJSON(sa.territorio) as area 
            FROM sectores_ambientales sa
            JOIN categoria_ambiental ca ON sa.id_categoria_ambiental = ca.id_categoria_ambiental
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ZonaAmbientalDTO(
                rs.getLong("id_zona_ambiental"),
                rs.getString("categoria_ambiental"),
                rs.getString("area")
        ));
    }

    // le agregue que tambien obtenga el id
    public List<Map<String, Object>> obtenerCategoriasPorPunto(Double lat, Double lng) {
        String sql = """
        SELECT DISTINCT sa.id_zona_ambiental, ca.id_categoria_ambiental, ca.categoria_ambiental
        FROM categoria_ambiental ca
        JOIN sectores_ambientales sa ON ca.id_categoria_ambiental = sa.id_categoria_ambiental
        WHERE ST_Intersects(sa.territorio, ST_SetSRID(ST_MakePoint(?, ?), 4326))
        ORDER BY ca.categoria_ambiental
        """;
        return jdbcTemplate.queryForList(sql, lng, lat);
    }
}