-- ============================================
-- 09-Triggers_geo.sql
-- Trigger Geoespacial
-- Validación: El arquero debe estar dentro de la zona de competencia
-- ============================================

CREATE OR REPLACE FUNCTION validar_registro_puntaje_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_zona_competencia GEOMETRY;
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
           t.geom_zona_competencia
    INTO v_estado_torneo,
         v_nombre_torneo,
         v_zona_competencia
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
    IF v_zona_competencia IS NULL THEN
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
    IF NOT ST_Contains(v_zona_competencia, NEW.posicion_arquero) THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El arquero se encuentra fuera de la zona de competencia del torneo "%".',
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