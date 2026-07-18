-- ============================================
-- 09-Triggers_geo.sql
-- Trigger Geoespacial: Validaciones de seguridad y geocercado
-- Incluye: ST_Contains, ST_Distance, ST_DistanceSphere
-- ============================================

CREATE OR REPLACE FUNCTION validar_restricciones_espaciales_participacion()
RETURNS TRIGGER AS $$
DECLARE
    v_zona_torneo GEOMETRY;
    v_linea_tiro GEOMETRY;
    v_esta_dentro BOOLEAN;
    v_distancia_linea FLOAT;
    v_arqueros_cercanos INT;
BEGIN
    -- Obtener geometrías del torneo
    SELECT geom_zona_competencia, linea_tiro
    INTO v_zona_torneo, v_linea_tiro
    FROM torneo
    WHERE id_torneo = NEW.id_torneo;

    -- Validar que el torneo tenga zona de competencia definida
    IF v_zona_torneo IS NULL THEN
        RAISE EXCEPTION 'El torneo especificado no tiene una zona de competencia definida.';
    END IF;

    -- 1. GEOCERCADO: Validar que el arquero esté dentro del polígono (ST_Contains)
    v_esta_dentro := ST_Contains(v_zona_torneo, NEW.ubicacion_arquero);
    IF NOT v_esta_dentro THEN
        RAISE EXCEPTION 'LÍMITE EXCEDIDO: El arquero está fuera de la zona de competencia del torneo.';
    END IF;

    -- 2. Validar distancia a la línea de tiro (máximo 5 metros)
    IF v_linea_tiro IS NOT NULL THEN
        v_distancia_linea := ST_Distance(
            NEW.ubicacion_arquero::geography,
            v_linea_tiro::geography
        );
        IF v_distancia_linea > 5.0 THEN
            RAISE EXCEPTION 'LÍMITE EXCEDIDO: El arquero se encuentra a % metros de la línea de tiro oficial (Max: 5m).',
                            ROUND(v_distancia_linea::numeric, 2);
        END IF;
    END IF;

    -- 3. SEGURIDAD: Validar separación mínima entre arqueros (5 metros)
    SELECT COUNT(*) INTO v_arqueros_cercanos
    FROM participacion
    WHERE id_torneo = NEW.id_torneo
      AND id_usuario <> NEW.id_usuario
      AND ST_DistanceSphere(ubicacion_arquero, NEW.ubicacion_arquero) < 5;

    IF v_arqueros_cercanos > 0 THEN
        RAISE EXCEPTION 'ALERTA SEGURIDAD: Hay otro arquero muy cerca en este puesto de tiro (Separación mínima: 5m).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------ nueva funcion trigger ------------------------------
CREATE OR REPLACE FUNCTION validar_registro_puntaje_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_ubicacion_arquero GEOMETRY;
    v_zona_competencia GEOMETRY;
    v_estado_torneo VARCHAR(80);
    v_nombre_torneo VARCHAR(80);
    v_id_torneo BIGINT;
    v_arqueros_cercanos INT;
BEGIN
    -- Obtener información del torneo y la ubicación del arquero --
    SELECT p.id_torneo, p.ubicacion_arquero
    INTO v_id_torneo, v_ubicacion_arquero
    FROM participacion p
    WHERE p.id_participacion = NEW.id_participacion;

    -- Obtener geometría de la zona de competencia y estado del torneo --
    SELECT t.estado_torneo, t.nombre_torneo, t.geom_zona_competencia
    INTO v_estado_torneo, v_nombre_torneo, v_zona_competencia
    FROM torneo t
    WHERE t.id_torneo = v_id_torneo;

    -- Validar que el torneo esté en estado "En curso" --
    IF v_estado_torneo IS DISTINCT FROM 'IN_COURSE' THEN
        RAISE EXCEPTION 'REGISTRO RECHAZADO: El torneo "%" no se encuentra en curso (Estado actual: %).',
                        v_nombre_torneo, v_estado_torneo;
    END IF;

    -- GEOCERCADO: Validar que el arquero esté dentro de la "Zona de Competencia" (ST_Contains) --
    IF v_zona_competencia IS NULL THEN
        RAISE EXCEPTION 'REGISTRO RECHAZADO: El torneo "%" no tiene una zona de competencia definida.', v_nombre_torneo;
    END IF;

    IF v_ubicacion_arquero IS NULL THEN
        RAISE EXCEPTION 'REGISTRO RECHAZADO: La ubicación del arquero no está definida.';
    END IF;

    IF NOT ST_Contains(v_zona_competencia, v_ubicacion_arquero) THEN
        RAISE EXCEPTION 'REGISTRO RECHAZADO: El arquero se encuentra fuera de la zona de competencia del torneo "%".',
                        v_nombre_torneo;
    END IF;

    -- VALIDACION DE SEGUIRIDAD: Validar separación mínima entre arqueros (5 metros segun enunciado) --
    SELECT COUNT(*) INTO v_arqueros_cercanos
    FROM participacion p
    WHERE p.id_torneo = v_id_torneo
      AND p.id_participacion <> NEW.id_participacion  -- Excluir al arquero actual
      AND ST_DistanceSphere(p.ubicacion_arquero, v_ubicacion_arquero) < 5.0;

    IF v_arqueros_cercanos > 0 THEN
        RAISE EXCEPTION 'ALERTA SEGURIDAD: Registro bloqueado. Se ha detectado a otro arquero activo a menos de 5 metros de distancia. (Separación mínima: 5m).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Aplicar trigger en INSERT y UPDATE de participacion
CREATE TRIGGER trigger_seguridad_y_geocercado
BEFORE INSERT OR UPDATE ON participacion
FOR EACH ROW
EXECUTE FUNCTION validar_restricciones_espaciales_participacion();

------------------- nueva funcion trigger ------------------------------
CREATE TRIGGER trigger_validar_registro_puntaje
BEFORE INSERT OR UPDATE ON puntaje
FOR EACH ROW
EXECUTE FUNCTION validar_registro_puntaje_fn();