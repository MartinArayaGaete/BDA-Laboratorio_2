package com.example.demo.repositories;

import com.example.demo.dtos.EstadisticaAmbientalDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class EstadisticasRepository {

    private final JdbcTemplate jdbcTemplate;

    public EstadisticasRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private EstadisticaAmbientalDTO mapRowToEstadisticaAmbiental(ResultSet rs) throws SQLException {
        EstadisticaAmbientalDTO dto = new EstadisticaAmbientalDTO();
        dto.setCondicionClimatica(rs.getString("condicion_climatica"));
        dto.setTotalFlechas(rs.getInt("total_flechas"));
        dto.setPromedioPuntaje(rs.getDouble("promedio_puntaje"));
        dto.setDesviacionPrecision(rs.getDouble("desviacion_precision"));
        return dto;
    }

    public List<EstadisticaAmbientalDTO> obtenerCorrelacionClimatica() {
        String sql = """
            SELECT 
                COALESCE(ca.categoria_ambiental, 'Normal') AS condicion_climatica,
                COUNT(f.id_flecha) AS total_flechas,
                ROUND(AVG(f.puntaje)::numeric, 2) AS promedio_puntaje,
                COALESCE(ROUND(STDDEV_SAMP(f.puntaje)::numeric, 2), 0) AS desviacion_precision
            FROM ronda r
            LEFT JOIN sectores_ambientales sa ON r.id_zona_ambiental = sa.id_zona_ambiental
            LEFT JOIN categoria_ambiental ca ON sa.id_categoria_ambiental = ca.id_categoria_ambiental
            JOIN puntaje_ronda pr ON pr.id_ronda = r.id_ronda
            JOIN flecha f ON f.id_puntaje_ronda = pr.id_puntaje_ronda
            GROUP BY ca.categoria_ambiental
            ORDER BY promedio_puntaje DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToEstadisticaAmbiental(rs));
    }
}