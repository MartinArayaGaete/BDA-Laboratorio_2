package com.example.demo.repositories;

import com.example.demo.dtos.FlechaArqueroDTO;
import com.example.demo.dtos.LeaderboardDTO;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.lang.Long;
import java.lang.String;

import java.sql.CallableStatement;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

@Repository
public class FlechaRepository {

    private final JdbcTemplate jdbcTemplate;

    public FlechaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FlechaArqueroDTO> obtenerFlechasDeArqueroEnTorneo(Long idUsuario, Long idTorneo) {
        String sql = """
                SELECT r.numero_ronda, f.id_flecha, f.puntaje
                FROM flecha f
                INNER JOIN puntaje_ronda pr ON f.id_puntaje_ronda = pr.id_puntaje_ronda
                INNER JOIN participacion p ON pr.id_participacion = p.id_participacion
                INNER JOIN ronda r ON pr.id_ronda = r.id_ronda
                WHERE p.id_usuario = ? AND p.id_torneo = ?
                ORDER BY r.numero_ronda ASC, f.id_flecha ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            FlechaArqueroDTO dto = new FlechaArqueroDTO();
            dto.setNumeroRonda(rs.getInt("numero_ronda"));
            dto.setIdFlecha(rs.getLong("id_flecha"));
            dto.setPuntaje(rs.getInt("puntaje"));
            return dto;
        }, idUsuario, idTorneo);
    }

    public List<FlechaArqueroDTO> obtenerFlechasDeArqueroEnRonda(Long idUsuario, Long idTorneo, Integer numeroRonda) {
        String sql = """
                SELECT r.numero_ronda, f.id_flecha, f.puntaje
                FROM flecha f
                INNER JOIN puntaje_ronda pr ON f.id_puntaje_ronda = pr.id_puntaje_ronda
                INNER JOIN participacion p ON pr.id_participacion = p.id_participacion
                INNER JOIN ronda r ON pr.id_ronda = r.id_ronda
                WHERE p.id_usuario = ? AND p.id_torneo = ? AND r.numero_ronda = ?
                ORDER BY f.id_flecha ASC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            FlechaArqueroDTO dto = new FlechaArqueroDTO();
            dto.setNumeroRonda(rs.getInt("numero_ronda"));
            dto.setIdFlecha(rs.getLong("id_flecha"));
            dto.setPuntaje(rs.getInt("puntaje"));
            return dto;
        }, idUsuario, idTorneo, numeroRonda);
    }

    public void guardarFlecha(Long idParticipacion, Long idRonda, Integer puntaje) {
        String sql = "INSERT INTO flecha (id_puntaje_ronda, puntaje) VALUES ((SELECT id_puntaje_ronda FROM" +
                " puntaje_ronda WHERE id_participacion = ? AND id_ronda = ?), ?)";
        jdbcTemplate.update(sql, idParticipacion, idRonda, puntaje);
    }

    // Ejecuta el Procedimiento Almacenado 1 de PostgreSQL
    public void guardarRondaCompletaSP(Long idRonda, Long idParticipacion, List<Integer> flechas, Long idAdmin) {
        jdbcTemplate.execute(
                (CallableStatementCreator) connection -> {
                    // Llamamos al procedure que recibe 4 parámetros
                    CallableStatement cs = connection.prepareCall("CALL registrar_puntaje_ronda(?, ?, ?, ?)");
                    cs.setLong(1, idRonda);
                    cs.setLong(2, idParticipacion);
                    // Mapeamos el arreglo a "numeric" para que calce con el DECIMAL[] de Postgres
                    cs.setArray(3, connection.createArrayOf("numeric", flechas.toArray(new Integer[0])));
                    cs.setLong(4, idAdmin);
                    return cs;
                },
                (CallableStatementCallback<Void>) cs -> {
                    cs.execute();
                    return null;
                }
        );
    }

    /**
     * Obtiene todas las flechas de un participante en una ronda específica.
     * Retorna Map con keys: id_flecha, puntaje
     */
    public List<Map<String, Object>> obtenerFlechasPorRonda(Long idParticipacion, Long idRonda) {
        String sql = """
            SELECT f.id_flecha, f.puntaje
            FROM flecha f
            INNER JOIN puntaje_ronda pr ON f.id_puntaje_ronda = pr.id_puntaje_ronda
            WHERE pr.id_participacion = ? AND pr.id_ronda = ?
            ORDER BY f.id_flecha ASC
            """;
        return jdbcTemplate.queryForList(sql, idParticipacion, idRonda);
    }

    /**
     * Obtiene todas las flechas para un conjunto de participaciones en una sola consulta.
     * Retorna Map con keys: id_participacion, numero_ronda, id_flecha, puntaje
     */
    public List<Map<String, Object>> obtenerFlechasPorParticipaciones(List<Long> idsParticipacion) {
        if (idsParticipacion == null || idsParticipacion.isEmpty()) return Collections.emptyList();

        String placeholders = idsParticipacion.stream().map(i -> "?").collect(Collectors.joining(","));
        String sql = String.format("""
            SELECT pr.id_participacion, r.numero_ronda, f.id_flecha, f.puntaje
            FROM flecha f
            INNER JOIN puntaje_ronda pr ON f.id_puntaje_ronda = pr.id_puntaje_ronda
            INNER JOIN ronda r ON pr.id_ronda = r.id_ronda
            WHERE pr.id_participacion IN (%s)
            ORDER BY pr.id_participacion ASC, r.numero_ronda ASC, f.id_flecha ASC
            """, placeholders);

        Object[] params = idsParticipacion.toArray();
        return jdbcTemplate.queryForList(sql, params);
    }

    /**
     * Método para obtener el Leaderboard Histórico
     * Retorna una lista de LeaderboardDTO con idUsuario, nombre y promedioPuntosFlecha
     * */
    public List<LeaderboardDTO> obtenerLeaderboardHistorico() {
        // CORRECCIÓN: Agregada la columna "posicion" al inicio del SELECT
        String sql = "SELECT posicion, id_usuario, nombre, promedio_puntos_flecha FROM leaderboard_top_50";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new LeaderboardDTO(
                        rs.getLong("id_usuario"),
                        rs.getString("nombre"),
                        rs.getDouble("promedio_puntos_flecha"),
                        rs.getInt("posicion")
                )
        );
    }

    // requerimiento 9: mejores del mes
    public List<LeaderboardDTO> obtenerMejoresArquerosUltimoMes() {
        String sql = """
        SELECT 
            u.id_usuario, 
            u.nombre, 
            COALESCE(AVG(f.puntaje), 0) AS promedio_puntos_flecha,
            DENSE_RANK() OVER (ORDER BY AVG(f.puntaje) DESC) as posicion
        FROM usuario u
        JOIN participacion p ON p.id_usuario = u.id_usuario
        JOIN torneo t ON p.id_torneo = t.id_torneo
        JOIN puntaje_ronda pr ON pr.id_participacion = p.id_participacion
        JOIN flecha f ON f.id_puntaje_ronda = pr.id_puntaje_ronda
        WHERE t.estado_torneo = 'COMPLETED' 
          AND t.fecha_termino >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY u.id_usuario, u.nombre
        ORDER BY promedio_puntos_flecha DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new LeaderboardDTO(
                        rs.getLong("id_usuario"),
                        rs.getString("nombre"),
                        rs.getDouble("promedio_puntos_flecha"),
                        rs.getInt("posicion")
                )
        );
    }
}