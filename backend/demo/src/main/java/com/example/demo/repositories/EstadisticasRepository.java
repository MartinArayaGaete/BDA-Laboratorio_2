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
        // la consulta SQL que calcula la correlación entre las condiciones climáticas y el desempeño de los arqueros
        String sql = """
            SELECT 
                ca.categoria_ambiental AS condicion_climatica,
                COUNT(pr.id_puntaje_ronda) AS total_flechas,
                ROUND(AVG(pr.puntaje_ronda), 2) AS promedio_puntaje,
                COALESCE(ROUND(STDDEV_SAMP(pr.puntaje_ronda), 2), 0) AS desviacion_precision 
            FROM puntaje_ronda pr
            JOIN sectores_ambientales sa 
                ON ST_Intersects(pr.posicion_diana, sa.territorio)
            JOIN categoria_ambiental ca 
                ON sa.id_categoria_ambiental = ca.id_categoria_ambiental
            GROUP BY ca.categoria_ambiental
            ORDER BY promedio_puntaje DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToEstadisticaAmbiental(rs));
    }
}