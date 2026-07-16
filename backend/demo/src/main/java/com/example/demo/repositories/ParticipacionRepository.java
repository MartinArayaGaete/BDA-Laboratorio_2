package com.example.demo.repositories;

import com.example.demo.dtos.InscritoDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.ConnectionCallback;
import java.sql.PreparedStatement;


@Repository
public class ParticipacionRepository {

    private final JdbcTemplate jdbcTemplate;

    public ParticipacionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void inscribirUsuario(Long idUsuario, Long idTorneo, String ubicacionArquero, String ubicacionBlanco) {
        String sql = "INSERT INTO participacion (id_usuario, id_torneo, ubicacion_arquero, ubicacion_blanco) " +
                "VALUES (?, ?, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))";
        jdbcTemplate.update(sql, idUsuario, idTorneo, ubicacionArquero, ubicacionBlanco);
    }

    public boolean existeParticipacion(Long idUsuario, Long idTorneo) {
        String sql = "SELECT COUNT(*) FROM participacion WHERE id_usuario = ? AND id_torneo = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario, idTorneo);
        return count != null && count > 0;
    }

    public boolean tieneFlechasRegistradasEnTorneo(Long idUsuario, Long idTorneo) {
        String sql = """
                SELECT COUNT(*)
                FROM flecha f
                INNER JOIN puntaje_ronda pr ON f.id_puntaje_ronda = pr.id_puntaje_ronda 
                INNER JOIN participacion p ON pr.id_participacion = p.id_participacion
                WHERE p.id_usuario = ? AND p.id_torneo = ?
                """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idUsuario, idTorneo);
        return count != null && count > 0;
    }

    public void desinscribirUsuario(Long idUsuario, Long idTorneo) {
        String sql = "DELETE FROM participacion WHERE id_usuario = ? AND id_torneo = ?";
        jdbcTemplate.update(sql, idUsuario, idTorneo);
    }

    public List<InscritoDTO> obtenerInscritosPorTorneo(Long idTorneo) {
        String sql = """
                SELECT p.id_participacion, u.id_usuario, u.rut, u.nombre
                FROM participacion p
                INNER JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE p.id_torneo = ?
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            InscritoDTO dto = new InscritoDTO();
            dto.setIdParticipacion(rs.getLong("id_participacion"));
            dto.setIdUsuario(rs.getLong("id_usuario"));
            dto.setRut(rs.getString("rut"));
            dto.setNombre(rs.getString("nombre"));
            return dto;
        }, idTorneo);
    }

    public Optional<Long> obtenerIdParticipacion(Long idUsuario, Long idTorneo) {
        String sql = "SELECT id_participacion FROM participacion WHERE id_usuario = ? AND id_torneo = ?";
        try {
            Long id = jdbcTemplate.queryForObject(sql, Long.class, idUsuario, idTorneo);
            return Optional.ofNullable(id);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void actualizarPuntajeFinalConTrigger(Long idAdmin, Long idRondaAfectada, Integer puntajeFinal, Long idUsuario, Long idTorneo) {
        jdbcTemplate.execute((ConnectionCallback<Void>) conn -> {
            
            // Usamos try-with-resources para asegurar que los PreparedStatements se cierren
            try (
                PreparedStatement ps1 = conn.prepareStatement("SET LOCAL my.user_id = ?");
                PreparedStatement ps2 = conn.prepareStatement("SET LOCAL my.ronda_id = ?");
                PreparedStatement ps3 = conn.prepareStatement(
                    "UPDATE participacion SET puntaje_final = ? WHERE id_usuario = ? AND id_torneo = ?"
                )
            ) {
                // Seteamos el ID de quien hace el cambio (Para el Trigger)
                ps1.setLong(1, idAdmin);
                ps1.execute();

                // Seteamos el ID de la ronda afectada (Para el Trigger)
                ps2.setLong(1, idRondaAfectada);
                ps2.execute();

                // Ejecutamos el Update real de la tabla
                ps3.setInt(1, puntajeFinal);
                ps3.setLong(2, idUsuario);
                ps3.setLong(3, idTorneo);
                ps3.executeUpdate();
            }
            return null; // El callback requiere retornar algo, mandamos null
        });
    }

    public List<Map<String, Object>> obtenerTodas() {
        String sql = """
            SELECT p.id_participacion, p.id_usuario, u.nombre, p.id_torneo, t.nombre_torneo, p.puntaje_final
            FROM participacion p
            JOIN usuario u ON p.id_usuario = u.id_usuario
            JOIN torneo t ON p.id_torneo = t.id_torneo
            ORDER BY p.id_participacion ASC
            """;
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Obtiene el total de participaciones de un usuario.
     */
    public Long contarParticipacionesPorUsuario(Long idUsuario) {
        String sql = "SELECT COUNT(*) FROM participacion WHERE id_usuario = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, idUsuario);
        return count != null ? count : 0;
    }

    /**
     * Obtiene participaciones paginadas de un usuario, unidas con datos del torneo.
     * Retorna Map con keys: id_participacion, id_torneo, nombre_torneo, puntaje_final, 
     * posicion_final, fecha_inicio, estado_torneo
     */
    public List<Map<String, Object>> obtenerHistorialPaginado(Long idUsuario, int page, int size) {
        String sql = """
            SELECT p.id_participacion, p.id_torneo, t.nombre_torneo, p.puntaje_final, 
                   p.posicion_final, t.fecha_inicio, t.estado_torneo
            FROM participacion p
            INNER JOIN torneo t ON p.id_torneo = t.id_torneo
            WHERE p.id_usuario = ?
            ORDER BY t.fecha_inicio DESC
            LIMIT ? OFFSET ?
            """;
        int offset = page * size;
        return jdbcTemplate.queryForList(sql, idUsuario, size, offset);
    }

    /**
     * Obtiene estadisticas agregadas del arquero en una sola consulta.
     */
    public Optional<Map<String, Object>> obtenerEstadisticasArquero(Long idUsuario) {
        String sql = """
            SELECT
                COUNT(DISTINCT p.id_torneo) AS torneos_totales,
                COUNT(f.id_flecha) AS total_flechas,
                COALESCE(SUM(CASE WHEN f.puntaje > 0 THEN 1 ELSE 0 END), 0) AS flechas_acertadas,
                COALESCE(SUM(COALESCE(f.puntaje, 0)), 0) AS total_puntos,
                COALESCE(AVG(f.puntaje), 0) AS promedio_puntos
            FROM participacion p
            LEFT JOIN puntaje_ronda pr ON pr.id_participacion = p.id_participacion
            LEFT JOIN flecha f ON f.id_puntaje_ronda = pr.id_puntaje_ronda
            WHERE p.id_usuario = ?
            """;

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, idUsuario);
        if (result.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(result.get(0));
    }

    /**
     * Obtiene un resumen agregado por torneo y arquero en una sola consulta.
     * Retorna keys: puntaje_final, posicion_final, total_flechas, promedio_puntos, rondas_jugadas
     */
    public Optional<Map<String, Object>> obtenerResumenPorTorneoYUsuario(Long idTorneo, Long idUsuario) {
        String sql = """
        SELECT p.puntaje_final,
               p.posicion_final,
               COUNT(f.id_flecha) AS total_flechas,
               COALESCE(ROUND(AVG(f.puntaje)::numeric, 2), 0) AS promedio_puntos,
               COUNT(DISTINCT pr.id_ronda) AS rondas_jugadas,
               obtener_clima_arquero(p.id_participacion) AS factor_ambiental -- <-- NUEVO CAMPO
        FROM participacion p
        LEFT JOIN puntaje_ronda pr ON pr.id_participacion = p.id_participacion
        LEFT JOIN flecha f ON f.id_puntaje_ronda = pr.id_puntaje_ronda
        WHERE p.id_torneo = ? AND p.id_usuario = ?
        GROUP BY p.id_participacion, p.puntaje_final, p.posicion_final
        """;

        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, idTorneo, idUsuario);
        if (result.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(result.get(0));
    }


    public boolean estaArqueroDentroDeLaZona(Long idTorneo, String ubicacionArqueroGeoJson) {
        String sql = """
        SELECT ST_Contains(t.geom_zona_competencia, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326))
        FROM torneo t
        WHERE t.id_torneo = ?
        """;

        // queryForObject devuelve el resultado de la función booleana de PostGIS
        Boolean resultado = jdbcTemplate.queryForObject(sql, Boolean.class, ubicacionArqueroGeoJson, idTorneo);
        return resultado != null && resultado;
    }


    public boolean existeArqueroCercano(Long idTorneo, Long idUsuario, String ubicacionArqueroGeoJson) {
        String sql = """
        SELECT COUNT(*)
        FROM participacion p
        WHERE p.id_torneo = ? 
          AND p.id_usuario != ?
          AND ST_DistanceSphere(p.ubicacion_arquero, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)) < 5.0
        """;

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idTorneo, idUsuario, ubicacionArqueroGeoJson);
        return count != null && count > 0;
    }

    /**
     * Obtiene los torneos en los que un usuario está inscrito.
     * Retorna Map con keys: id_torneo, nombre_torneo, estado_torneo, fecha_inicio, fecha_termino, id_participacion
     */
    public List<Map<String, Object>> obtenerTorneosInscritosPorUsuario(Long idUsuario) {
        String sql = """
        SELECT t.id_torneo, t.nombre_torneo, t.estado_torneo, 
               t.fecha_inicio, t.fecha_termino, p.id_participacion
        FROM participacion p
        INNER JOIN torneo t ON p.id_torneo = t.id_torneo
        WHERE p.id_usuario = ?
        ORDER BY t.fecha_inicio DESC
        """;
        return jdbcTemplate.queryForList(sql, idUsuario);
    }


    /**
     * Obtiene todos los arqueros con sus posiciones para un torneo específico.
     */
    public List<Map<String, Object>> obtenerArquerosConPosiciones(Long idTorneo) {
        String sql = """
        SELECT 
            u.id_usuario, 
            u.nombre, 
            u.rut,
            ST_AsGeoJSON(p.ubicacion_arquero) as ubicacion_arquero,
            ST_AsGeoJSON(p.ubicacion_blanco) as ubicacion_blanco
        FROM participacion p
        INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_torneo = ?
        """;
        return jdbcTemplate.queryForList(sql, idTorneo);
    }
}