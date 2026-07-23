package com.example.demo.repositories;

import com.example.demo.models.Ronda;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class RondaRepository {

    private final JdbcTemplate jdbcTemplate;

    public RondaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Ronda mapRowToRonda(ResultSet rs) throws SQLException {
        Ronda r = new Ronda();
        r.setIdRonda(rs.getLong("id_ronda"));
        r.setIdTorneo(rs.getLong("id_torneo"));
        r.setNumeroRonda(rs.getInt("numero_ronda"));
        Long idZona = rs.getLong("id_zona_ambiental");
        if (!rs.wasNull()) {
            r.setIdZonaAmbiental(idZona);
        }
        return r;
    }

    public List<Ronda> buscarPorTorneo(Long idTorneo) {
        String sql = "SELECT id_ronda, id_torneo, numero_ronda, id_zona_ambiental FROM ronda WHERE id_torneo = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToRonda(rs), idTorneo);
    }

    public void crearRonda(Long idTorneo, Integer numeroRonda) {
        String sql = "INSERT INTO ronda (id_torneo, numero_ronda) VALUES (?, ?)";
        jdbcTemplate.update(sql, idTorneo, numeroRonda);
    }

    public boolean existeRonda(Long idTorneo, Integer numeroRonda) {
        String sql = "SELECT COUNT(*) FROM ronda WHERE id_torneo = ? AND numero_ronda = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idTorneo, numeroRonda);
        return count != null && count > 0;
    }

    public Optional<Long> obtenerIdRonda(Long idTorneo, Integer numeroRonda) {
        String sql = "SELECT id_ronda FROM ronda WHERE id_torneo = ? AND numero_ronda = ?";
        try {
            Long id = jdbcTemplate.queryForObject(sql, Long.class, idTorneo, numeroRonda);
            return Optional.ofNullable(id);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Integer obtenerPuntajeCalculadoRonda(Long idParticipacion, Long idRonda) {
        String sql = "SELECT puntaje_ronda FROM puntaje_ronda WHERE id_participacion = ? AND id_ronda = ?";
        try {
            return jdbcTemplate.queryForObject(sql, Integer.class, idParticipacion, idRonda);
        } catch (EmptyResultDataAccessException e) {
            return 0;
        }
    }

    public List<Ronda> obtenerTodas() {
        String sql = "SELECT id_ronda, id_torneo, numero_ronda, id_zona_ambiental FROM ronda ORDER BY id_torneo ASC, numero_ronda ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToRonda(rs));
    }

    public List<Map<String, Object>> obtenerRondasConPuntajesPorParticipacion(Long idParticipacion, Long idTorneo) {
        String sql = """
            SELECT r.id_ronda, r.numero_ronda, COALESCE(pr.puntaje_ronda, 0) as puntaje_ronda
            FROM ronda r
            LEFT JOIN puntaje_ronda pr ON r.id_ronda = pr.id_ronda 
                AND pr.id_participacion = ?
            WHERE r.id_torneo = ?
            ORDER BY r.numero_ronda ASC
            """;
        return jdbcTemplate.queryForList(sql, idParticipacion, idTorneo);
    }

    public int asignarZonaAmbiental(Long idRonda, Long idZonaAmbiental) {
        String sql = "UPDATE ronda SET id_zona_ambiental = ? WHERE id_ronda = ?";
        return jdbcTemplate.update(sql, idZonaAmbiental, idRonda);
    }

    public int eliminarRonda(Long idRonda) {
        String sql = "DELETE FROM ronda WHERE id_ronda = ? " +
                "AND id_torneo IN (SELECT id_torneo FROM torneo WHERE estado_torneo = 'NOT_STARTED')";
        return jdbcTemplate.update(sql, idRonda);
    }

    public Optional<Ronda> buscarPorId(Long idRonda) {
        String sql = "SELECT id_ronda, id_torneo, numero_ronda, id_zona_ambiental FROM ronda WHERE id_ronda = ?";
        try {
            Ronda r = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> mapRowToRonda(rs), idRonda);
            return Optional.ofNullable(r);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}