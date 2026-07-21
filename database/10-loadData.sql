DELETE FROM sectores_ambientales;
DELETE FROM categoria_ambiental;
ALTER SEQUENCE categoria_ambiental_id_categoria_ambiental_seq RESTART WITH 1;
ALTER SEQUENCE sectores_ambientales_id_zona_ambiental_seq RESTART WITH 1;

INSERT INTO categoria_ambiental (categoria_ambiental) VALUES
('Viento Fuerte'),
('Lluvia Ligera'),
('Calma Total');

INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6500,-33.4500],[-70.6460,-33.4500],[-70.6460,-33.4460],[-70.6500,-33.4460],[-70.6500,-33.4500]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6500,-33.4500],[-70.6460,-33.4500],[-70.6460,-33.4460],[-70.6500,-33.4460],[-70.6500,-33.4500]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6500,-33.4500],[-70.6460,-33.4500],[-70.6460,-33.4460],[-70.6500,-33.4460],[-70.6500,-33.4500]]]}'), 4326));