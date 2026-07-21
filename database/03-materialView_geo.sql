-- ============================================
-- 03-materialView_geo.sql
-- Índices Espaciales GIST para PostGIS
-- ============================================

-- Índices GIST para optimizar consultas espaciales
CREATE INDEX idx_torneo_geom ON torneo USING GIST (espacio_torneo);
CREATE INDEX idx_puntaje_ronda_arquero_geom ON puntaje_ronda USING GIST (posicion_arquero);
CREATE INDEX idx_puntaje_ronda_diana_geom ON puntaje_ronda USING GIST (posicion_diana);
CREATE INDEX idx_sectores_ambientales_geom ON sectores_ambientales USING GIST (territorio);