-- ============================================
-- Procedimiento Almacenado 1: Registrar Ronda Completa
-- ============================================

CREATE OR REPLACE PROCEDURE registrar_puntaje_ronda(
    p_id_ronda BIGINT,
    p_id_participacion BIGINT,
    p_puntajes_flechas DECIMAL[],
    p_id_admin BIGINT,
    p_posicion_arquero GEOMETRY,
    p_posicion_diana GEOMETRY
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_torneo_id BIGINT;
    v_estado VARCHAR(80);
    v_puntaje_total DECIMAL := 0;
    v_id_puntaje_ronda BIGINT;
    v_puntaje DECIMAL;
    v_hay_flechas BOOLEAN;
BEGIN
    PERFORM set_config('my.user_id', p_id_admin::text, true);
    PERFORM set_config('my.ronda_id', p_id_ronda::text, true);

    SELECT id_torneo INTO v_torneo_id FROM ronda WHERE id_ronda = p_id_ronda;
    SELECT estado_torneo INTO v_estado FROM torneo WHERE id_torneo = v_torneo_id;

    IF v_estado <> 'IN_COURSE' THEN
        RAISE EXCEPTION 'El torneo no está en curso';
    END IF;

    v_hay_flechas := array_length(p_puntajes_flechas, 1) IS NOT NULL
                     AND array_length(p_puntajes_flechas, 1) > 0;

    IF v_hay_flechas THEN
        FOREACH v_puntaje IN ARRAY p_puntajes_flechas LOOP
            IF v_puntaje < 0 OR v_puntaje > 10 THEN
                RAISE EXCEPTION 'Puntaje inválido: %', v_puntaje;
            END IF;
            v_puntaje_total := v_puntaje_total + v_puntaje;
        END LOOP;
    END IF;

    INSERT INTO puntaje_ronda (id_ronda, id_participacion, puntaje_ronda, posicion_arquero, posicion_diana)
    VALUES (p_id_ronda, p_id_participacion, v_puntaje_total, p_posicion_arquero, p_posicion_diana)
    ON CONFLICT (id_ronda, id_participacion)
    DO UPDATE SET
        puntaje_ronda = EXCLUDED.puntaje_ronda,
        posicion_arquero = EXCLUDED.posicion_arquero,
        posicion_diana = EXCLUDED.posicion_diana
    RETURNING id_puntaje_ronda INTO v_id_puntaje_ronda;

    IF v_hay_flechas THEN
        DELETE FROM flecha WHERE id_puntaje_ronda = v_id_puntaje_ronda;
        FOREACH v_puntaje IN ARRAY p_puntajes_flechas LOOP
            INSERT INTO flecha (id_puntaje_ronda, puntaje) VALUES (v_id_puntaje_ronda, v_puntaje);
        END LOOP;
    END IF;

    UPDATE participacion p
    SET puntaje_final = (
        SELECT COALESCE(SUM(pr.puntaje_ronda), 0)
        FROM puntaje_ronda pr
        WHERE pr.id_participacion = p.id_participacion
    )
    WHERE p.id_participacion = p_id_participacion;
END;
$$;