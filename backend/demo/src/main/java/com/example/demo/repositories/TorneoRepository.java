package com.example.demo.repositories;

import com.example.demo.dtos.InscritoDTO;
import com.example.demo.models.Torneo;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Repository
public class TorneoRepository {

    private final JdbcTemplate jdbcTemplate;

    public TorneoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Torneo mapRowToTorneo(ResultSet rs) throws SQLException {
        Torneo t = new Torneo();
        t.setIdTorneo(rs.getLong("id_torneo"));
        t.setIdCategoria(rs.getLong("id_categoria"));
        t.setNombreTorneo(rs.getString("nombre_torneo"));
        t.setEstadoTorneo(rs.getString("estado_torneo"));
        t.setFechaInicio(rs.getObject("fecha_inicio", LocalDate.class));
        t.setFechaTermino(rs.getObject("fecha_termino", LocalDate.class));
        t.setGeomZonaCompetencia(rs.getString("espacio_torneo"));
        t.setLineaTiro(rs.getString("linea_de_tiro"));
        t.setNroPlazaMax(rs.getInt("nro_plaza_max"));
        t.setNroPlazaActual(rs.getInt("nro_plaza_actual"));
        return t;
    }

    public void crearTorneo(Long idCategoria, String nombre, String estado,
                            LocalDate inicio, LocalDate termino,
                            String espacioTorneo, String lineaDeTiro,
                            Integer nroPlazaMax) {
        String sql = "INSERT INTO torneo (id_categoria, nombre_torneo, estado_torneo, " +
                "fecha_inicio, fecha_termino, espacio_torneo, linea_de_tiro, " +
                "nro_plaza_max, nro_plaza_actual) " +
                "VALUES (?, ?, ?, ?, ?, ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), " +
                "ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), ?, 0)";
        jdbcTemplate.update(sql, idCategoria, nombre, estado, inicio, termino,
                espacioTorneo, lineaDeTiro, nroPlazaMax);
    }

    public int incrementarPlazaActual(Long idTorneo) {
        String sql = "UPDATE torneo SET nro_plaza_actual = nro_plaza_actual + 1 " +
                "WHERE id_torneo = ? AND nro_plaza_actual < nro_plaza_max";
        return jdbcTemplate.update(sql, idTorneo);
    }

    public int decrementarPlazaActual(Long idTorneo) {
        String sql = "UPDATE torneo SET nro_plaza_actual = nro_plaza_actual - 1 " +
                "WHERE id_torneo = ? AND nro_plaza_actual > 0";
        return jdbcTemplate.update(sql, idTorneo);
    }

    public List<Torneo> obtenerTodos() {
        String sql = "SELECT id_torneo, id_categoria, nombre_torneo, estado_torneo, " +
                "fecha_inicio, fecha_termino, nro_plaza_max, nro_plaza_actual, " +
                "ST_AsGeoJSON(espacio_torneo) AS espacio_torneo, " +
                "ST_AsGeoJSON(linea_de_tiro) AS linea_de_tiro FROM torneo";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToTorneo(rs));
    }

    public Long contarTorneos() {
        String sql = "SELECT COUNT(*) FROM torneo";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public Long contarTorneosPorEstado(String estadoTorneo) {
        String sql = "SELECT COUNT(*) FROM torneo WHERE estado_torneo = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, estadoTorneo);
        return count != null ? count : 0;
    }

    public List<Map<String, Object>> obtenerTorneosPaginados(int page, int size) {
        String sql = """
            SELECT id_torneo, id_categoria, nombre_torneo, estado_torneo, 
                   fecha_inicio, fecha_termino, nro_plaza_max, nro_plaza_actual
            FROM torneo
            ORDER BY fecha_inicio DESC, id_torneo DESC
            LIMIT ? OFFSET ?
            """;
        int offset = page * size;
        return jdbcTemplate.queryForList(sql, size, offset);
    }

    public List<Map<String, Object>> obtenerTorneosPorEstadoPaginados(String estadoTorneo, int page, int size) {
        String sql = """
            SELECT id_torneo, id_categoria, nombre_torneo, estado_torneo, 
                   fecha_inicio, fecha_termino, nro_plaza_max, nro_plaza_actual
            FROM torneo
            WHERE estado_torneo = ?
            ORDER BY fecha_inicio DESC, id_torneo DESC
            LIMIT ? OFFSET ?
            """;
        int offset = page * size;
        return jdbcTemplate.queryForList(sql, estadoTorneo, size, offset);
    }

    public Optional<Torneo> buscarPorId(Long idTorneo) {
        String sql = "SELECT id_torneo, id_categoria, nombre_torneo, estado_torneo, " +
                "fecha_inicio, fecha_termino, nro_plaza_max, nro_plaza_actual, " +
                "ST_AsGeoJSON(espacio_torneo) AS espacio_torneo, " +
                "ST_AsGeoJSON(linea_de_tiro) AS linea_de_tiro " +
                "FROM torneo WHERE id_torneo = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> mapRowToTorneo(rs), idTorneo));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void finalizarTorneo(Long idTorneo) {
        jdbcTemplate.update("UPDATE torneo SET estado_torneo = 'COMPLETED' WHERE id_torneo = ?", idTorneo);
    }

    public void actualizarPosicionesSP(Long idTorneo) {
        jdbcTemplate.update("CALL actualizar_posiciones(?)", idTorneo);
    }

    public List<InscritoDTO> obtenerPodio(Long idTorneo) {
        String sql = """
            SELECT p.id_participacion, u.id_usuario, u.rut, u.nombre 
            FROM participacion p 
            JOIN usuario u ON p.id_usuario = u.id_usuario 
            WHERE p.id_torneo = ? AND p.posicion_final <= 3 
            ORDER BY p.posicion_final ASC
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

    public int iniciarTorneo(Long idTorneo) {
        String sql = "UPDATE torneo SET estado_torneo = 'IN_COURSE' WHERE id_torneo = ? AND estado_torneo = 'NOT_STARTED'";
        return jdbcTemplate.update(sql, idTorneo);
    }

    public Long contarTorneosDisponibles(Long idUsuario) {
        String sql = """
            SELECT COUNT(DISTINCT t.id_torneo) as total
            FROM torneo t
            LEFT JOIN participacion p ON t.id_torneo = p.id_torneo AND p.id_usuario = ?
            WHERE t.estado_torneo = 'NOT_STARTED' AND p.id_participacion IS NULL
            AND t.nro_plaza_actual < t.nro_plaza_max
            """;
        Long count = jdbcTemplate.queryForObject(sql, Long.class, idUsuario);
        return count != null ? count : 0;
    }

    public List<Map<String, Object>> obtenerTorneosDisponiblesPaginados(Long idUsuario, int page, int size) {
        String sql = """
            SELECT DISTINCT t.id_torneo, t.nombre_torneo, t.estado_torneo, 
                   t.fecha_inicio, t.fecha_termino, t.id_categoria, c.nombre_categoria,
                   t.nro_plaza_max, t.nro_plaza_actual,
                   (t.nro_plaza_max - t.nro_plaza_actual) as plazas_disponibles
            FROM torneo t
            LEFT JOIN participacion p ON t.id_torneo = p.id_torneo AND p.id_usuario = ?
            LEFT JOIN categoria c ON t.id_categoria = c.id_categoria
            WHERE t.estado_torneo = 'NOT_STARTED' AND p.id_participacion IS NULL
            AND t.nro_plaza_actual < t.nro_plaza_max
            ORDER BY t.fecha_inicio ASC
            LIMIT ? OFFSET ?
            """;
        int offset = page * size;
        return jdbcTemplate.queryForList(sql, idUsuario, size, offset);
    }

    public List<Map<String, Object>> obtenerClimasPorTorneo(Long idTorneo) {
        String sql = """
            SELECT DISTINCT sa.id_zona_ambiental, ca.categoria_ambiental
            FROM torneo t
            JOIN sectores_ambientales sa ON ST_Intersects(t.espacio_torneo, sa.territorio)
            JOIN categoria_ambiental ca ON sa.id_categoria_ambiental = ca.id_categoria_ambiental
            WHERE t.id_torneo = ?
        """;
        return jdbcTemplate.queryForList(sql, idTorneo);
    }



    /**
     * Obtiene las posiciones de todos los arqueros en una ronda específica.
     */
    public List<Map<String, Object>> obtenerPosicionesPorRonda(Long idTorneo, Integer numeroRonda) {
        String sql = """
        SELECT 
            u.id_usuario,
            u.nombre,
            u.rut,
            p.id_participacion,
            ST_AsGeoJSON(pr.posicion_arquero) as posicion_arquero,
            ST_AsGeoJSON(pr.posicion_diana) as posicion_diana,
            pr.puntaje_ronda
        FROM ronda r
        JOIN puntaje_ronda pr ON pr.id_ronda = r.id_ronda
        JOIN participacion p ON pr.id_participacion = p.id_participacion
        JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE r.id_torneo = ? AND r.numero_ronda = ?
        ORDER BY u.nombre
        """;
        return jdbcTemplate.queryForList(sql, idTorneo, numeroRonda);
    }

    /**
     * Obtiene la posición de un arquero específico en una ronda específica.
     */
    public Optional<Map<String, Object>> obtenerPosicionArqueroEnRonda(Long idTorneo, Integer numeroRonda, Long idUsuario) {
        String sql = """
        SELECT 
            u.id_usuario,
            u.nombre,
            u.rut,
            p.id_participacion,
            ST_AsGeoJSON(pr.posicion_arquero) as posicion_arquero,
            ST_AsGeoJSON(pr.posicion_diana) as posicion_diana,
            pr.puntaje_ronda,
            COALESCE(
                (SELECT json_agg(f.puntaje ORDER BY f.id_flecha)
                 FROM flecha f WHERE f.id_puntaje_ronda = pr.id_puntaje_ronda),
                '[]'::json
            ) as flechas
        FROM ronda r
        JOIN puntaje_ronda pr ON pr.id_ronda = r.id_ronda
        JOIN participacion p ON pr.id_participacion = p.id_participacion
        JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE r.id_torneo = ? AND r.numero_ronda = ? AND u.id_usuario = ?
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, idTorneo, numeroRonda, idUsuario);
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }


    public int eliminarTorneo(Long idTorneo) {
        String sql = "DELETE FROM torneo WHERE id_torneo = ? AND estado_torneo = 'NOT_STARTED'";
        return jdbcTemplate.update(sql, idTorneo);
    }


    public int actualizarTorneo(Long idTorneo, String nombreTorneo, LocalDate fechaInicio,
                                LocalDate fechaTermino, Integer nroPlazaMax,
                                String espacioTorneo, String lineaDeTiro) {
        String sql = """
        UPDATE torneo SET 
            nombre_torneo = ?, 
            fecha_inicio = ?, 
            fecha_termino = ?, 
            nro_plaza_max = ?,
            espacio_torneo = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326),
            linea_de_tiro = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)
        WHERE id_torneo = ? AND estado_torneo = 'NOT_STARTED'
        """;
        return jdbcTemplate.update(sql, nombreTorneo, fechaInicio, fechaTermino,
                nroPlazaMax, espacioTorneo, lineaDeTiro, idTorneo);
    }

}
