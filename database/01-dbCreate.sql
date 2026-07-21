-- ============================================
-- 01-dbCreate.sql
-- Creación de la base de datos y tablas
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. LIMPIEZA ATÓMICA DE TABLAS
DROP TABLE IF EXISTS flecha CASCADE;
DROP TABLE IF EXISTS puntaje_ronda CASCADE;
DROP TABLE IF EXISTS ronda CASCADE;
DROP TABLE IF EXISTS participacion CASCADE;
DROP TABLE IF EXISTS zona_ambiental CASCADE;
DROP TABLE IF EXISTS torneo CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- 2. CREACIÓN DE TABLAS
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    correo VARCHAR(80) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_categoria VARCHAR(80) NOT NULL,
    distancia_tiro BIGINT 
);

CREATE TABLE IF NOT EXISTS logs (
    id_logs BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_admin BIGINT NOT NULL,
    id_afectado BIGINT NOT NULL,
    fecha_editado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    torneo_afectado INT NOT NULL,
    ronda_afectada INT NOT NULL,
    puntaje_anterior INT,
    puntaje_nuevo INT,
    FOREIGN KEY (id_admin) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_afectado) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS torneo (
    id_torneo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria BIGINT NOT NULL,
    nombre_torneo VARCHAR(80) NOT NULL,
    estado_torneo VARCHAR(80) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    espacio_torneo GEOMETRY(Polygon, 4326),
    linea_de_tiro GEOMETRY(LineString, 4326),
    nro_plaza_max INT,
    nro_plaza_actual INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);


CREATE TABLE IF NOT EXISTS participacion (
    id_participacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_torneo BIGINT NOT NULL,
    puntaje_final INT,
    posicion_final INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_torneo) REFERENCES torneo(id_torneo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categoria_ambiental (
         id_categoria_ambiental BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY
       KEY,
         categoria_ambiental VARCHAR(80) NOT NULL
     );

 CREATE TABLE IF NOT EXISTS sectores_ambientales (
         id_zona_ambiental BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
         id_categoria_ambiental BIGINT NOT NULL,
         territorio GEOMETRY(Polygon, 4326),
         FOREIGN KEY (id_categoria_ambiental)
             REFERENCES categoria_ambiental(id_categoria_ambiental)
             ON DELETE CASCADE
     );
    


CREATE TABLE IF NOT EXISTS ronda (
    id_ronda BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_torneo BIGINT NOT NULL,
    id_zona_ambiental BIGINT,          -- NULLABLE, el admin la asigna si es que hay un clima
    numero_ronda INT NOT NULL,
    FOREIGN KEY (id_torneo) REFERENCES torneo(id_torneo) ON DELETE CASCADE,
    FOREIGN KEY (id_zona_ambiental) REFERENCES sectores_ambientales(id_zona_ambiental) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS puntaje_ronda (
    id_puntaje_ronda BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ronda BIGINT NOT NULL,
    id_participacion BIGINT NOT NULL,

    puntaje_ronda INT,

    posicion_arquero GEOMETRY(Point,4326),
    posicion_diana GEOMETRY(Point,4326),

    CONSTRAINT unique_ronda_participacion UNIQUE (id_ronda,id_participacion),

    FOREIGN KEY (id_ronda)
        REFERENCES ronda(id_ronda)
        ON DELETE CASCADE,

    FOREIGN KEY (id_participacion)
        REFERENCES participacion(id_participacion)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flecha (
    id_flecha BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_puntaje_ronda BIGINT NOT NULL,
    puntaje INT NOT NULL,
    FOREIGN KEY (id_puntaje_ronda) REFERENCES puntaje_ronda(id_puntaje_ronda) ON DELETE CASCADE
);


-- 3. ÍNDICES TRADICIONALES (B-Tree)
CREATE INDEX idx_torneo_categoria ON torneo(id_categoria);
CREATE INDEX idx_participacion_usuario ON participacion(id_usuario);
CREATE INDEX idx_puntaje_ronda_participacion ON puntaje_ronda(id_participacion);