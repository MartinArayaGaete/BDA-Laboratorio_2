-- ============================================
-- 05-StoredProced.sql
-- Procedimiento Almacenado 2: Calcular Ranking al Finalizar Torneo
-- ============================================

CREATE OR REPLACE PROCEDURE actualizar_posiciones(p_id_torneo BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_torneo torneo.estado_torneo%TYPE;
BEGIN
    -- Validar que el torneo existe
    SELECT t.estado_torneo INTO v_estado_torneo
    FROM torneo t
    WHERE t.id_torneo = p_id_torneo;

    IF v_estado_torneo IS NULL THEN
        RAISE EXCEPTION 'El torneo no existe.';
    END IF;

    -- Validar que el torneo está finalizado
    IF v_estado_torneo <> 'COMPLETED' THEN
        RAISE EXCEPTION 'El torneo no ha finalizado.';
    END IF;

    -- Actualizar posiciones usando DENSE_RANK
    UPDATE participacion p
    SET posicion_final = ranking.posicion
    FROM (
        SELECT
            id_participacion,
            DENSE_RANK() OVER (
                ORDER BY COALESCE(puntaje_final, 0) DESC
            ) AS posicion
        FROM participacion
        WHERE id_torneo = p_id_torneo
    ) ranking
    WHERE p.id_participacion = ranking.id_participacion;
END;
$$;