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


----------------------------------------------------------------

-- SE AGREGA NUEVA COLUMNA A LA TABLA CATEGORIA PARA ALMACENAR LA DISTANCIA OFICIAL DE TIRO
ALTER TABLE categoria ADD COLUMN IF NOT EXISTS distacia_oficial FLOAT;

-- registro de las normativas oficiales de distancia por categoría
UPDATE categoria SET distacia_oficial = 70.0 WHERE nombre_categoria = 'Recurvo';
UPDATE categoria SET distacia_oficial = 50.0 WHERE nombre_categoria = 'Compuesto';
UPDATE categoria SET distacia_oficial = 40.0 WHERE nombre_categoria = 'Tradicional';
UPDATE categoria SET distacia_oficial = 30.0 WHERE nombre_categoria = 'Infantil';

-- Funcion para calcular distancia y validad normativas
CREATE OR REPLACE FUNCTION validar_normativa_distancia_categoria(p_id_participacion BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_distancia_real FLOAT;
    v_distancia_oficial FLOAT;  
    v_categoria_nombre VARCHAR(80);
    
BEGIN
    -- obtener la distancia requerida parametrizada y el nombre de categoria
    SELECT c.distacia_oficial, c.nombre_categoria
    INTO v_distancia_oficial, v_categoria_nombre
    FROM participacion p
    JOIN torneo t ON p.id_torneo = t.id_torneo
    JOIN categoria c ON t.id_categoria = c.id_categoria
    WHERE p.id_participacion = p_id_participacion;

    -- si no hay distancia configurada, se asume que no hay restricción
    IF v_distancia_oficial IS NULL THEN
        RETURN TRUE;
    END IF;

    -- calcular distancia real usando geografia
    SELECT ST_Distance(
        p.ubicacion_arquero::geography,
        p.ubicacion_blanco::geography
    ) INTO v_distancia_real
    FROM participacion p
    WHERE p.id_participacion = p_id_participacion;

    -- verificar que la distancia real no exceda la distancia oficial
    IF v_distancia_real > v_distancia_oficial THEN
        RAISE EXCEPTION 'INCUMPLIMIENTO NORMATIVA: % metros (Máximo permitido: % metros para categoría %)',
                        ROUND(v_distancia_real::numeric, 2), v_distancia_oficial, v_categoria_nombre;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
    