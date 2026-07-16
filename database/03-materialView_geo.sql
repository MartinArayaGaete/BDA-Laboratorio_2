-- ============================================
-- 03-materialView_geo.sql
-- Índices Espaciales GIST para PostGIS
-- ============================================

-- Índices GIST para optimizar consultas espaciales
CREATE INDEX idx_torneo_geom ON torneo USING GIST (geom_zona_competencia);
CREATE INDEX idx_participacion_arquero_geom ON participacion USING GIST (ubicacion_arquero);
CREATE INDEX idx_participacion_blanco_geom ON participacion USING GIST (ubicacion_blanco);
CREATE INDEX idx_zona_ambiental_geom ON zona_ambiental USING GIST (geom_area);