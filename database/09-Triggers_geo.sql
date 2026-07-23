-- ============================================
-- 09-Triggers_geo.sql
-- Trigger Geoespacial
-- Validación: El arquero debe estar dentro de la zona de competencia
-- ============================================

CREATE OR REPLACE FUNCTION validar_registro_puntaje_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_espacio_torneo GEOMETRY;
    v_estado_torneo VARCHAR(80);
    v_nombre_torneo VARCHAR(80);
    v_id_torneo BIGINT;
BEGIN
    -- Obtener torneo asociado a la participación
    SELECT p.id_torneo
    INTO v_id_torneo
    FROM participacion p
    WHERE p.id_participacion = NEW.id_participacion;

    -- Obtener información del torneo
    SELECT t.estado_torneo,
           t.nombre_torneo,
           t.espacio_torneo
    INTO v_estado_torneo,
         v_nombre_torneo,
         v_espacio_torneo
    FROM torneo t
    WHERE t.id_torneo = v_id_torneo;

    -- Validar estado del torneo
    IF v_estado_torneo IS DISTINCT FROM 'IN_COURSE' THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El torneo "%" no se encuentra en curso (Estado actual: %).',
        v_nombre_torneo,
        v_estado_torneo;
    END IF;

    -- Validar existencia de la zona de competencia
    IF v_espacio_torneo IS NULL THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El torneo "%" no tiene una zona de competencia definida.',
        v_nombre_torneo;
    END IF;

    -- Validar existencia de la posición del arquero
    IF NEW.posicion_arquero IS NULL THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: La posición del arquero no está definida.';
    END IF;

    -- Validar geocercado
    IF NOT ST_Contains(v_espacio_torneo, NEW.posicion_arquero) THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El arquero se encuentra fuera de la zona de competencia del torneo "%".',
        v_nombre_torneo;
    END IF;

    -- Validar seguridad: Los arqueros deben estar a mas de 5 metros de distancia entre sí
    IF EXISTS (
        SELECT 1
        FROM puntaje_ronda pr
        JOIN participacion p ON p.id_participacion = pr.id_participacion
        WHERE p.id_torneo = v_id_torneo
          AND pr.posicion_arquero IS NOT NULL
          AND ST_Distance(pr.posicion_arquero, NEW.posicion_arquero) < 5
    ) THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: La posición del arquero está demasiado cerca (<5m) de otro arquero en el torneo "%".',
        v_nombre_torneo;
    END IF;

    -- Validar que la distancia de tiro del arquero coincida exactamente con la distancia de tiro del torneo
    IF NEW.distancia_tiro IS DISTINCT FROM (
        SELECT t.distancia_tiro
        FROM torneo t
        WHERE t.id_torneo = v_id_torneo
    ) THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: La distancia de tiro del arquero no coincide con la distancia de tiro del torneo "%".',
        v_nombre_torneo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_registro_puntaje
BEFORE INSERT OR UPDATE
ON puntaje_ronda
FOR EACH ROW
EXECUTE FUNCTION validar_registro_puntaje_fn();