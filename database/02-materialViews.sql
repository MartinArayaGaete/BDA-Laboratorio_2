-- ============================================
-- 02-materialViews.sql
-- Vistas Materializadas para reportes
-- ============================================

-- Vista Materializada: Leaderboard Histórico Top 50
CREATE MATERIALIZED VIEW leaderboard_top_50 AS
SELECT
    DENSE_RANK() OVER (
        ORDER BY promedio_puntos_flecha DESC
    ) AS posicion,
    id_usuario,
    nombre,
    promedio_puntos_flecha
FROM (
    SELECT
        u.id_usuario,
        u.nombre,
        COALESCE(AVG(f.puntaje), 0) AS promedio_puntos_flecha
    FROM usuario u
    JOIN participacion p ON p.id_usuario = u.id_usuario
    JOIN puntaje_ronda pr ON pr.id_participacion = p.id_participacion
    JOIN flecha f ON f.id_puntaje_ronda = pr.id_puntaje_ronda
    WHERE p.posicion_final IS NOT NULL
    GROUP BY u.id_usuario, u.nombre
) ranking
ORDER BY promedio_puntos_flecha DESC
LIMIT 50;

-- Índice único sobre la vista materializada
CREATE UNIQUE INDEX idx_leaderboard_top_50_usuario ON leaderboard_top_50(id_usuario);

-- Para refrescar la vista materializada:
-- REFRESH MATERIALIZED VIEW leaderboard_top_50;