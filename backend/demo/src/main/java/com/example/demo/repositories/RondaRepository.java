package com.example.demo.repositories;

import com.example.demo.models.Ronda;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class RondaRepository {

    private final JdbcTemplate jdbcTemplate;

    public RondaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Obtiene todas las rondas asociadas a un torneo
    public List<Ronda> buscarPorTorneo(Long idTorneo) {
        String sql = "SELECT * FROM ronda WHERE id_torneo = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Ronda r = new Ronda();
            r.setIdRonda(rs.getLong("id_ronda"));
            r.setIdTorneo(rs.getLong("id_torneo"));
            r.setNumeroRonda(rs.getInt("numero_ronda"));
            return r;
        }, idTorneo);
    }

    // Crea una ronda para un torneo especifico
    public void crearRonda(Long idTorneo, Integer numeroRonda) {
        String sql = "INSERT INTO ronda (id_torneo, numero_ronda) VALUES (?, ?)";
        jdbcTemplate.update(sql, idTorneo, numeroRonda);
    }

    // Verifica si una ronda ya existe en un torneo
    public boolean existeRonda(Long idTorneo, Integer numeroRonda) {
        String sql = "SELECT COUNT(*) FROM ronda WHERE id_torneo = ? AND numero_ronda = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, idTorneo, numeroRonda);
        return count != null && count > 0;
    }

    // Obtiene el id de la ronda para un torneo y numero dados
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
            return 0; // Si aún no hay puntaje registrado
        }
    }

    public List<Ronda> obtenerTodas() {
        String sql = "SELECT * FROM ronda ORDER BY id_torneo ASC, numero_ronda ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Ronda r = new Ronda();
            r.setIdRonda(rs.getLong("id_ronda"));
            r.setIdTorneo(rs.getLong("id_torneo"));
            r.setNumeroRonda(rs.getInt("numero_ronda"));
            return r;
        });
    }

    /**
     * Obtiene todas las rondas con sus puntajes para una participación en un torneo específico.
     * Retorna Map con keys: id_ronda, numero_ronda, puntaje_ronda
     */
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
}