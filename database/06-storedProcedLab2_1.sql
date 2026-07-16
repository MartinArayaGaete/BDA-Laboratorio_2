-- ============================================
-- 06-StoredProced_geo.sql
-- Función: Obtener factor climático/ambiental del arquero
-- Análisis Espacial de Desempeño
-- ============================================

CREATE OR REPLACE FUNCTION obtener_clima_arquero(p_id_participacion BIGINT)
RETURNS VARCHAR(80) AS $$
DECLARE
    v_tipo_clima VARCHAR(80);
BEGIN
    -- Detectar si el arquero está dentro de una zona ambiental
    SELECT za.tipo INTO v_tipo_clima
    FROM participacion p
    JOIN zona_ambiental za ON ST_Intersects(za.geom_area, p.ubicacion_arquero)
    WHERE p.id_participacion = p_id_participacion
    LIMIT 1;

    -- Retornar el tipo de clima o "Despejado" por defecto
    RETURN COALESCE(v_tipo_clima, 'Despejado / Sin Alteraciones');
END;
$$ LANGUAGE plpgsql;