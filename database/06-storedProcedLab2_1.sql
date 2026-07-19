-- ============================================
-- 06-StoredProced_geo.sql
-- Función: Obtener categoría ambiental
-- del sector donde se encuentra el arquero
-- ============================================

CREATE OR REPLACE FUNCTION obtener_categoria_ambiental(
    p_id_puntaje_ronda BIGINT
)
RETURNS VARCHAR(80) AS $$
DECLARE
    v_categoria VARCHAR(80);
BEGIN

    -- Obtener la categoría ambiental del sector
    -- donde se encuentra la posición del arquero

    SELECT ca.categoria_ambiental
    INTO v_categoria
    FROM puntaje_ronda pr
    JOIN sectores_ambientales sa
        ON ST_Intersects(sa.territorio, pr.posicion_arquero)
    JOIN categoria_ambiental ca
        ON sa.id_categoria_ambiental = ca.id_categoria_ambiental
    WHERE pr.id_puntaje_ronda = p_id_puntaje_ronda
    LIMIT 1;

    RETURN COALESCE(v_categoria, 'Sin categoría ambiental');

END;
$$ LANGUAGE plpgsql;