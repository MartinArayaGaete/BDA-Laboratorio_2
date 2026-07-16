package com.example.demo.repositories;

import com.example.demo.dtos.LogDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class LogRepository {

    private final JdbcTemplate jdbcTemplate;

    public LogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long contarLogs() {
        String sql = "SELECT COUNT(*) FROM logs";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public List<LogDTO> obtenerLogsRecientes(int limit, int offset) {
        String sql = """
            SELECT 
                l.id_logs,
                l.id_admin, -- <-- AHORA SÍ TRAEMOS EL ID
                ua.nombre AS nombre_admin,
                uaf.nombre AS nombre_afectado,
                t.nombre_torneo,
                l.ronda_afectada,
                l.puntaje_anterior,
                l.puntaje_nuevo,
                l.fecha_editado
            FROM logs l
            JOIN usuario ua ON l.id_admin = ua.id_usuario
            JOIN usuario uaf ON l.id_afectado = uaf.id_usuario
            JOIN torneo t ON l.torneo_afectado = t.id_torneo
            ORDER BY l.fecha_editado DESC
            LIMIT ? OFFSET ?
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new LogDTO(
                rs.getLong("id_logs"),
                rs.getLong("id_admin"),
                rs.getString("nombre_admin"),
                rs.getString("nombre_afectado"),
                rs.getString("nombre_torneo"),
                rs.getInt("ronda_afectada"),
                rs.getInt("puntaje_anterior"),
                rs.getInt("puntaje_nuevo"),
                rs.getTimestamp("fecha_editado").toLocalDateTime()
        ), limit, offset);
    }
}