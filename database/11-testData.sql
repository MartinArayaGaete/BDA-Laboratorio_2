-- ============================================
-- 11-testData.sql
-- Datos de prueba para torneo y rondas
-- ============================================

INSERT INTO categoria (nombre_categoria, distancia_tiro) VALUES 
('Recurvo Adulto', 70);

INSERT INTO torneo (id_categoria, nombre_torneo, estado_torneo, fecha_inicio, fecha_termino, nro_plaza_max, nro_plaza_actual) VALUES 
(1, 'Torneo Nacional de Invierno', 'Activo', '2026-08-01', '2026-08-05', 100, 10);

INSERT INTO ronda (id_torneo, id_zona_ambiental, numero_ronda) VALUES 
(1, NULL, 1),
(1, NULL, 2);
