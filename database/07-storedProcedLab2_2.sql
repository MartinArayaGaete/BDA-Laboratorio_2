-- ============================================
-- 07-StoredProced_geo.sql
-- Funciones Geoespaciales
-- Cálculo de distancia entre arquero y diana
-- Validación de normativas por categoría
-- ============================================

-- ============================================
-- Calcular distancia real entre arquero y diana
-- ============================================

CREATE OR REPLACE FUNCTION calcular_distancia_tiro(p_id_puntaje_ronda BIGINT)
RETURNS FLOAT AS $$
DECLARE
    v_distancia FLOAT;
BEGIN
    SELECT ST_Distance(
        pr.posicion_arquero::geography,
        pr.posicion_diana::geography
    )
    INTO v_distancia
    FROM puntaje_ronda pr
    WHERE pr.id_puntaje_ronda = p_id_puntaje_ronda;

    RETURN ROUND(v_distancia::numeric, 2);
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- Validar una distancia máxima recibida como parámetro
-- ============================================

CREATE OR REPLACE FUNCTION validar_distancia_categoria(
    p_id_puntaje_ronda BIGINT,
    p_distancia_maxima FLOAT DEFAULT 90.0
)
RETURNS BOOLEAN AS $$
DECLARE
    v_distancia FLOAT;
    v_categoria VARCHAR(80);
BEGIN

    -- Obtener distancia real
    v_distancia := calcular_distancia_tiro(p_id_puntaje_ronda);

    -- Obtener categoría del torneo
    SELECT c.nombre_categoria
    INTO v_categoria
    FROM puntaje_ronda pr
    JOIN participacion p
        ON pr.id_participacion = p.id_participacion
    JOIN torneo t
        ON p.id_torneo = t.id_torneo
    JOIN categoria c
        ON t.id_categoria = c.id_categoria
    WHERE pr.id_puntaje_ronda = p_id_puntaje_ronda;

    -- Validar distancia
    IF v_distancia > p_distancia_maxima THEN
        RAISE EXCEPTION
        'DISTANCIA EXCEDIDA: % metros (Máximo permitido: % metros para categoría %)',
        v_distancia,
        p_distancia_maxima,
        v_categoria;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- Validar normativa oficial de la categoría
-- ============================================

CREATE OR REPLACE FUNCTION validar_normativa_distancia_categoria(
    p_id_puntaje_ronda BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_distancia_real FLOAT;
    v_distancia_oficial INT;
    v_categoria_nombre VARCHAR(80);
BEGIN

    -- Obtener distancia oficial configurada para la categoría
    SELECT c.distancia_tiro,
           c.nombre_categoria
    INTO v_distancia_oficial,
         v_categoria_nombre
    FROM puntaje_ronda pr
    JOIN participacion p
        ON pr.id_participacion = p.id_participacion
    JOIN torneo t
        ON p.id_torneo = t.id_torneo
    JOIN categoria c
        ON t.id_categoria = c.id_categoria
    WHERE pr.id_puntaje_ronda = p_id_puntaje_ronda;

    -- Si la categoría no tiene distancia configurada
    IF v_distancia_oficial IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Calcular distancia real entre arquero y diana
    v_distancia_real := calcular_distancia_tiro(p_id_puntaje_ronda);

    -- Validar normativa
    IF v_distancia_real > v_distancia_oficial THEN
        RAISE EXCEPTION
        'INCUMPLIMIENTO NORMATIVA: % metros (Máximo permitido: % metros para categoría %)',
        ROUND(v_distancia_real::numeric, 2),
        v_distancia_oficial,
        v_categoria_nombre;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;