DELETE FROM sectores_ambientales;
DELETE FROM categoria_ambiental;
ALTER SEQUENCE categoria_ambiental_id_categoria_ambiental_seq RESTART WITH 1;
ALTER SEQUENCE sectores_ambientales_id_zona_ambiental_seq RESTART WITH 1;

INSERT INTO categoria_ambiental (categoria_ambiental) VALUES
('Viento Fuerte'),
('Lluvia Ligera'),
('Calma Total');

-- Zona Centro (Plaza de Armas)
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6510,-33.4360],[-70.6490,-33.4360],[-70.6490,-33.4340],[-70.6510,-33.4340],[-70.6510,-33.4360]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6515,-33.4375],[-70.6495,-33.4375],[-70.6495,-33.4355],[-70.6515,-33.4355],[-70.6515,-33.4375]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6500,-33.4380],[-70.6480,-33.4380],[-70.6480,-33.4360],[-70.6500,-33.4360],[-70.6500,-33.4380]]]}'), 4326));

-- Zona Providencia
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6200,-33.4300],[-70.6150,-33.4300],[-70.6150,-33.4250],[-70.6200,-33.4250],[-70.6200,-33.4300]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6220,-33.4320],[-70.6170,-33.4320],[-70.6170,-33.4270],[-70.6220,-33.4270],[-70.6220,-33.4320]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6180,-33.4280],[-70.6160,-33.4280],[-70.6160,-33.4260],[-70.6180,-33.4260],[-70.6180,-33.4280]]]}'), 4326));

-- Zona Las Condes
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5900,-33.4100],[-70.5850,-33.4100],[-70.5850,-33.4050],[-70.5900,-33.4050],[-70.5900,-33.4100]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5950,-33.4150],[-70.5900,-33.4150],[-70.5900,-33.4100],[-70.5950,-33.4100],[-70.5950,-33.4150]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5880,-33.4080],[-70.5860,-33.4080],[-70.5860,-33.4060],[-70.5880,-33.4060],[-70.5880,-33.4080]]]}'), 4326));

-- Zona Ñuñoa
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6100,-33.4600],[-70.6050,-33.4600],[-70.6050,-33.4550],[-70.6100,-33.4550],[-70.6100,-33.4600]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6080,-33.4580],[-70.6060,-33.4580],[-70.6060,-33.4560],[-70.6080,-33.4560],[-70.6080,-33.4580]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6120,-33.4620],[-70.6070,-33.4620],[-70.6070,-33.4570],[-70.6120,-33.4570],[-70.6120,-33.4620]]]}'), 4326));

-- Zona La Florida
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5800,-33.5200],[-70.5750,-33.5200],[-70.5750,-33.5150],[-70.5800,-33.5150],[-70.5800,-33.5200]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5850,-33.5250],[-70.5800,-33.5250],[-70.5800,-33.5200],[-70.5850,-33.5200],[-70.5850,-33.5250]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5780,-33.5180],[-70.5760,-33.5180],[-70.5760,-33.5160],[-70.5780,-33.5160],[-70.5780,-33.5180]]]}'), 4326));

-- Zona Maipú
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7700,-33.4900],[-70.7650,-33.4900],[-70.7650,-33.4850],[-70.7700,-33.4850],[-70.7700,-33.4900]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7750,-33.4950],[-70.7700,-33.4950],[-70.7700,-33.4900],[-70.7750,-33.4900],[-70.7750,-33.4950]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7680,-33.4880],[-70.7660,-33.4880],[-70.7660,-33.4860],[-70.7680,-33.4860],[-70.7680,-33.4880]]]}'), 4326));

-- Zona Pudahuel
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7900,-33.4400],[-70.7850,-33.4400],[-70.7850,-33.4350],[-70.7900,-33.4350],[-70.7900,-33.4400]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7950,-33.4450],[-70.7900,-33.4450],[-70.7900,-33.4400],[-70.7950,-33.4400],[-70.7950,-33.4450]]]}'), 4326));

-- Zona Quilicura
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7300,-33.3600],[-70.7250,-33.3600],[-70.7250,-33.3550],[-70.7300,-33.3550],[-70.7300,-33.3600]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7350,-33.3650],[-70.7300,-33.3650],[-70.7300,-33.3600],[-70.7350,-33.3600],[-70.7350,-33.3650]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7280,-33.3580],[-70.7260,-33.3580],[-70.7260,-33.3560],[-70.7280,-33.3560],[-70.7280,-33.3580]]]}'), 4326));

-- Zona Huechuraba
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6600,-33.3700],[-70.6550,-33.3700],[-70.6550,-33.3650],[-70.6600,-33.3650],[-70.6600,-33.3700]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6650,-33.3750],[-70.6600,-33.3750],[-70.6600,-33.3700],[-70.6650,-33.3700],[-70.6650,-33.3750]]]}'), 4326));

-- Zona Vitacura
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5800,-33.3900],[-70.5750,-33.3900],[-70.5750,-33.3850],[-70.5800,-33.3850],[-70.5800,-33.3900]]]}'), 4326)),
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5850,-33.3950],[-70.5800,-33.3950],[-70.5800,-33.3900],[-70.5850,-33.3900],[-70.5850,-33.3950]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5780,-33.3880],[-70.5760,-33.3880],[-70.5760,-33.3860],[-70.5780,-33.3860],[-70.5780,-33.3880]]]}'), 4326));

-- Zona La Reina
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5600,-33.4400],[-70.5550,-33.4400],[-70.5550,-33.4350],[-70.5600,-33.4350],[-70.5600,-33.4400]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5650,-33.4450],[-70.5600,-33.4450],[-70.5600,-33.4400],[-70.5650,-33.4400],[-70.5650,-33.4450]]]}'), 4326));

-- Zona Peñalolén
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5400,-33.4800],[-70.5350,-33.4800],[-70.5350,-33.4750],[-70.5400,-33.4750],[-70.5400,-33.4800]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5450,-33.4850],[-70.5400,-33.4850],[-70.5400,-33.4800],[-70.5450,-33.4800],[-70.5450,-33.4850]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5380,-33.4780],[-70.5360,-33.4780],[-70.5360,-33.4760],[-70.5380,-33.4760],[-70.5380,-33.4780]]]}'), 4326));

-- Zona San Miguel
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6600,-33.4900],[-70.6550,-33.4900],[-70.6550,-33.4850],[-70.6600,-33.4850],[-70.6600,-33.4900]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6650,-33.4950],[-70.6600,-33.4950],[-70.6600,-33.4900],[-70.6650,-33.4900],[-70.6650,-33.4950]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6580,-33.4880],[-70.6560,-33.4880],[-70.6560,-33.4860],[-70.6580,-33.4860],[-70.6580,-33.4880]]]}'), 4326));

-- Zona Estación Central
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6900,-33.4500],[-70.6850,-33.4500],[-70.6850,-33.4450],[-70.6900,-33.4450],[-70.6900,-33.4500]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6950,-33.4550],[-70.6900,-33.4550],[-70.6900,-33.4500],[-70.6950,-33.4500],[-70.6950,-33.4550]]]}'), 4326)),
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6880,-33.4480],[-70.6860,-33.4480],[-70.6860,-33.4460],[-70.6880,-33.4460],[-70.6880,-33.4480]]]}'), 4326));

-- Zona Independencia
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6600,-33.4100],[-70.6550,-33.4100],[-70.6550,-33.4050],[-70.6600,-33.4050],[-70.6600,-33.4100]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.6650,-33.4150],[-70.6600,-33.4150],[-70.6600,-33.4100],[-70.6650,-33.4100],[-70.6650,-33.4150]]]}'), 4326));

-- Zona Renca
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7200,-33.4000],[-70.7150,-33.4000],[-70.7150,-33.3950],[-70.7200,-33.3950],[-70.7200,-33.4000]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7250,-33.4050],[-70.7200,-33.4050],[-70.7200,-33.4000],[-70.7250,-33.4000],[-70.7250,-33.4050]]]}'), 4326));

-- Zona Lo Barnechea
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(3, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5200,-33.3500],[-70.5150,-33.3500],[-70.5150,-33.3450],[-70.5200,-33.3450],[-70.5200,-33.3500]]]}'), 4326)),
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5250,-33.3550],[-70.5200,-33.3550],[-70.5200,-33.3500],[-70.5250,-33.3500],[-70.5250,-33.3550]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.5180,-33.3480],[-70.5160,-33.3480],[-70.5160,-33.3460],[-70.5180,-33.3460],[-70.5180,-33.3480]]]}'), 4326));

-- Zona Cerrillos
INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) VALUES
(1, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7200,-33.5000],[-70.7150,-33.5000],[-70.7150,-33.4950],[-70.7200,-33.4950],[-70.7200,-33.5000]]]}'), 4326)),
(2, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-70.7250,-33.5050],[-70.7200,-33.5050],[-70.7200,-33.5000],[-70.7250,-33.5000],[-70.7250,-33.5050]]]}'), 4326));