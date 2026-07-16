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

    -- 3. SEGURIDAD: Validar separación mínima entre arqueros (1.5 metros)
    SELECT COUNT(*) INTO v_arqueros_cercanos
    FROM participacion
    WHERE id_torneo = NEW.id_torneo
      AND id_usuario <> NEW.id_usuario
      AND ST_DistanceSphere(ubicacion_arquero, NEW.ubicacion_arquero) < 1.5;

    IF v_arqueros_cercanos > 0 THEN
        RAISE EXCEPTION 'ALERTA SEGURIDAD: Hay otro arquero muy cerca en este puesto de tiro (Separación mínima: 1.5m).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger en INSERT y UPDATE de participacion
CREATE TRIGGER trigger_seguridad_y_geocercado
BEFORE INSERT OR UPDATE ON participacion
FOR EACH ROW
EXECUTE FUNCTION validar_restricciones_espaciales_participacion();