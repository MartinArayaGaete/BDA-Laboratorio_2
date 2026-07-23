-- ============================================
-- 09-Triggers_geo.sql
-- Trigger Geoespacial
-- Validaciones:
--   1. Torneo en estado IN_COURSE
--   2. Zona de competencia definida
--   3. Arquero dentro del polígono (ST_Contains)
--   4. Separación mínima de 5 metros entre arqueros (ST_DistanceSphere)
--   5. Distancia arquero-diana ≤ distancia de categoría (ST_DistanceSphere)
-- ============================================

CREATE OR REPLACE FUNCTION validar_registro_puntaje_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_espacio_torneo GEOMETRY;
    v_estado_torneo VARCHAR(80);
    v_nombre_torneo VARCHAR(80);
    v_id_torneo BIGINT;
    v_distancia_categoria INT;
    v_distancia_tiro FLOAT;
BEGIN
    -- Obtener torneo asociado a la participación
    SELECT p.id_torneo
    INTO v_id_torneo
    FROM participacion p
    WHERE p.id_participacion = NEW.id_participacion;

    -- Obtener información del torneo y distancia de la categoría
    SELECT t.estado_torneo,
           t.nombre_torneo,
           t.espacio_torneo,
           c.distancia_tiro
    INTO v_estado_torneo,
         v_nombre_torneo,
         v_espacio_torneo,
         v_distancia_categoria
    FROM torneo t
    JOIN categoria c ON t.id_categoria = c.id_categoria
    WHERE t.id_torneo = v_id_torneo;

    -- 1. Validar estado del torneo
    IF v_estado_torneo IS DISTINCT FROM 'IN_COURSE' THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El torneo "%" no se encuentra en curso (Estado actual: %).',
        v_nombre_torneo,
        v_estado_torneo;
    END IF;

    -- 2. Validar existencia de la zona de competencia
    IF v_espacio_torneo IS NULL THEN
        RAISE EXCEPTION
        'REGISTRO RECHAZADO: El torneo "%" no tiene una zona de competencia definida.',
        v_nombre_torneo;
    END IF;

    -- 3. Si hay posición del arquero, validar geocercado y seguridad
    IF NEW.posicion_arquero IS NOT NULL THEN

        -- 3a. Validar que el arquero esté dentro de la zona de competencia
        IF NOT ST_Contains(v_espacio_torneo, NEW.posicion_arquero) THEN
            RAISE EXCEPTION
            'REGISTRO RECHAZADO: El arquero se encuentra fuera de la zona de competencia del torneo "%".',
            v_nombre_torneo;
        END IF;

        -- 3b. Validar separación mínima de 5 metros entre arqueros en la MISMA ronda
        IF EXISTS (
            SELECT 1
            FROM puntaje_ronda pr2
            WHERE pr2.id_ronda = NEW.id_ronda
              AND pr2.id_puntaje_ronda IS DISTINCT FROM NEW.id_puntaje_ronda
              AND pr2.posicion_arquero IS NOT NULL
              AND ST_DistanceSphere(pr2.posicion_arquero, NEW.posicion_arquero) < 5.0
        ) THEN
            RAISE EXCEPTION
            'REGISTRO RECHAZADO: Otro arquero está a menos de 5 metros en el torneo "%".',
            v_nombre_torneo;
        END IF;

        -- 3c. Validar distancia entre arquero y diana según categoría
        IF NEW.posicion_diana IS NOT NULL AND v_distancia_categoria IS NOT NULL THEN
            v_distancia_tiro := ST_DistanceSphere(NEW.posicion_arquero, NEW.posicion_diana);
            IF v_distancia_tiro > v_distancia_categoria THEN
                RAISE EXCEPTION
                'REGISTRO RECHAZADO: Distancia de tiro excedida. Distancia: % metros (Máximo permitido: % metros para esta categoría).',
                ROUND(v_distancia_tiro::numeric, 2),
                v_distancia_categoria;
            END IF;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_registro_puntaje ON puntaje_ronda;

CREATE TRIGGER trigger_validar_registro_puntaje
BEFORE INSERT OR UPDATE
ON puntaje_ronda
FOR EACH ROW
EXECUTE FUNCTION validar_registro_puntaje_fn();