-- ============================================
-- 07-StoredProced_geo.sql
-- Función: Calcular distancia real entre arquero y blanco
-- Validación de normativas de distancia por categoría
-- ============================================

CREATE OR REPLACE FUNCTION calcular_distancia_tiro(p_id_participacion BIGINT)
RETURNS FLOAT AS $$
DECLARE
    v_distancia FLOAT;
BEGIN
    -- Calcular distancia en metros entre arquero y su blanco asignado
    SELECT ST_Distance(
        p.ubicacion_arquero::geography,
        p.ubicacion_blanco::geography
    ) INTO v_distancia
    FROM participacion p
    WHERE p.id_participacion = p_id_participacion;

    RETURN ROUND(v_distancia::numeric, 2);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION validar_distancia_categoria(
    p_id_participacion BIGINT,
    p_distancia_maxima FLOAT DEFAULT 90.0
)
RETURNS BOOLEAN AS $$
DECLARE
    v_distancia FLOAT;
    v_categoria VARCHAR(80);
BEGIN
    -- Obtener la distancia real
    v_distancia := calcular_distancia_tiro(p_id_participacion);

    -- Obtener la categoría del torneo
    SELECT c.nombre_categoria INTO v_categoria
    FROM participacion p
    JOIN torneo t ON p.id_torneo = t.id_torneo
    JOIN categoria c ON t.id_categoria = c.id_categoria
    WHERE p.id_participacion = p_id_participacion;

    -- Validar distancia según categoría
    IF v_distancia > p_distancia_maxima THEN
        RAISE EXCEPTION 'DISTANCIA EXCEDIDA: % metros (Máximo permitido: % metros para categoría %)',
                        v_distancia, p_distancia_maxima, v_categoria;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;