-- ============================================
-- 06-loadData-geo.sql
-- Carga de datos de prueba, compatible con el
-- trigger geoespacial trigger_validar_registro_puntaje
-- ============================================

DO $$
DECLARE
    v_admin_id BIGINT;
    v_torneo_id BIGINT;
    v_ronda_id BIGINT;
    v_part_id BIGINT;
    v_ronda_ids BIGINT[];
    v_flechas DECIMAL[];
    v_fecha_inicio DATE;
    v_fecha_termino DATE;

    -- Variables geoespaciales
    v_base_lon DECIMAL;
    v_base_lat DECIMAL;
    v_zona GEOMETRY;
    v_pos_arquero GEOMETRY;
    v_pos_diana GEOMETRY;

    i INT;
    j INT;
    rec RECORD;
BEGIN
    -- 0. Limpieza profunda
    TRUNCATE TABLE flecha, puntaje_ronda, ronda, participacion, torneo, usuario, categoria, logs
    RESTART IDENTITY CASCADE;

    -- 1. Insertar Categorías
    INSERT INTO categoria (nombre_categoria) VALUES
    ('Recurvo 18m Novatos'),
    ('Recurvo 70m Avanzado'),
    ('Compuesto 50m Libre');

    -- 2. Insertar Administrador principal
    INSERT INTO usuario (rut, nombre, correo, contrasena, rol)
    VALUES ('1111111-1', 'Admin Supremo', 'admin@sistema.cl', 'admin123', 'ADMIN')
    RETURNING id_usuario INTO v_admin_id;

    -- 3. Generar 80 Arqueros de prueba
    FOR i IN 1..80 LOOP
        INSERT INTO usuario (rut, nombre, correo, contrasena, rol)
        VALUES ((10000000 + i) || '-K', 'Arquero ' || i, 'arquero' || i || '@mail.com', 'arco123', 'ARQUERO');
    END LOOP;

    ---------------------------------------------------------
    -- 4. CREAR 150 TORNEOS "COMPLETED" (50 recientes, 100 históricos)
    ---------------------------------------------------------
    FOR i IN 1..150 LOOP
        IF i <= 50 THEN
            v_fecha_termino := CURRENT_DATE - (floor(random() * 28) + 1)::INT;
        ELSE
            v_fecha_termino := CURRENT_DATE - (floor(random() * 165) + 35)::INT;
        END IF;
        v_fecha_inicio := v_fecha_termino - 2;

        -- Coordenada base distinta por torneo (zona de Santiago, desplazada)
        v_base_lon := -70.6483 + (i * 0.01);
        v_base_lat := -33.4489 + (i * 0.005);

        -- Zona de competencia: rectángulo ~100m alrededor de la base
        v_zona := ST_MakeEnvelope(
            v_base_lon - 0.0005, v_base_lat - 0.0005,
            v_base_lon + 0.0005, v_base_lat + 0.0005,
            4326
        );

        INSERT INTO torneo (id_categoria, nombre_torneo, estado_torneo, fecha_inicio, fecha_termino, geom_zona_competencia)
        VALUES (1 + (i % 3), 'Copa Nacional ' || i, 'IN_COURSE', v_fecha_inicio, v_fecha_termino, v_zona)
        RETURNING id_torneo INTO v_torneo_id;

        -- Posiciones (siempre dentro de la zona)
        v_pos_arquero := ST_SetSRID(ST_MakePoint(v_base_lon, v_base_lat), 4326);
        v_pos_diana   := ST_SetSRID(ST_MakePoint(v_base_lon + 0.0002, v_base_lat + 0.0002), 4326);

        -- Crear 3 Rondas
        v_ronda_ids := ARRAY[]::BIGINT[];
        FOR j IN 1..3 LOOP
            INSERT INTO ronda (id_torneo, numero_ronda) VALUES (v_torneo_id, j)
            RETURNING id_ronda INTO v_ronda_id;
            v_ronda_ids := v_ronda_ids || v_ronda_id;
        END LOOP;

        -- Seleccionar 8 arqueros al azar
        FOR rec IN (SELECT id_usuario FROM usuario WHERE rol = 'ARQUERO' ORDER BY random() LIMIT 8) LOOP
            INSERT INTO participacion (id_usuario, id_torneo) VALUES (rec.id_usuario, v_torneo_id)
            RETURNING id_participacion INTO v_part_id;

            FOR j IN 1..3 LOOP
                v_flechas := ARRAY[
                    LEAST(10, floor(random() * 4) + (rec.id_usuario % 6) + 3),
                    LEAST(10, floor(random() * 4) + (rec.id_usuario % 6) + 3),
                    LEAST(10, floor(random() * 4) + (rec.id_usuario % 6) + 3)
                ]::DECIMAL[];

                -- IMPORTANTE: se agregan posicion_arquero y posicion_diana
                CALL registrar_puntaje_ronda(
                    v_ronda_ids[j], v_part_id, v_flechas, v_admin_id,
                    v_pos_arquero, v_pos_diana
                );
            END LOOP;
        END LOOP;

        UPDATE torneo SET estado_torneo = 'COMPLETED' WHERE id_torneo = v_torneo_id;
        CALL actualizar_posiciones(v_torneo_id);
    END LOOP;

    ---------------------------------------------------------
    -- 5. CREAR 30 TORNEOS "NOT_STARTED"
    ---------------------------------------------------------
    FOR i IN 1..30 LOOP
        v_base_lon := -70.6483 + ((150 + i) * 0.01);
        v_base_lat := -33.4489 + ((150 + i) * 0.005);
        v_zona := ST_MakeEnvelope(
            v_base_lon - 0.0005, v_base_lat - 0.0005,
            v_base_lon + 0.0005, v_base_lat + 0.0005,
            4326
        );

        INSERT INTO torneo (id_categoria, nombre_torneo, estado_torneo, fecha_inicio, fecha_termino, geom_zona_competencia)
        VALUES (1 + (i % 3), 'Open Futuro ' || i, 'NOT_STARTED', CURRENT_DATE + i + 10, CURRENT_DATE + i + 12, v_zona)
        RETURNING id_torneo INTO v_torneo_id;

        FOR rec IN (SELECT id_usuario FROM usuario WHERE rol = 'ARQUERO' ORDER BY random() LIMIT 3) LOOP
            INSERT INTO participacion (id_usuario, id_torneo) VALUES (rec.id_usuario, v_torneo_id);
        END LOOP;

        FOR j IN 1..3 LOOP
            INSERT INTO ronda (id_torneo, numero_ronda) VALUES (v_torneo_id, j);
        END LOOP;
    END LOOP;

    ---------------------------------------------------------
    -- 6. CREAR 10 TORNEOS "IN_COURSE" (sin puntajes aún, para pruebas del Admin)
    ---------------------------------------------------------
    FOR i IN 1..10 LOOP
        v_base_lon := -70.6483 + ((180 + i) * 0.01);
        v_base_lat := -33.4489 + ((180 + i) * 0.005);
        v_zona := ST_MakeEnvelope(
            v_base_lon - 0.0005, v_base_lat - 0.0005,
            v_base_lon + 0.0005, v_base_lat + 0.0005,
            4326
        );

        INSERT INTO torneo (id_categoria, nombre_torneo, estado_torneo, fecha_inicio, fecha_termino, geom_zona_competencia)
        VALUES (1 + (i % 3), 'Torneo Activo ' || i, 'IN_COURSE', CURRENT_DATE - 1, CURRENT_DATE + 2, v_zona)
        RETURNING id_torneo INTO v_torneo_id;

        FOR rec IN (SELECT id_usuario FROM usuario WHERE rol = 'ARQUERO' ORDER BY random() LIMIT 5) LOOP
            INSERT INTO participacion (id_usuario, id_torneo) VALUES (rec.id_usuario, v_torneo_id);
        END LOOP;

        FOR j IN 1..3 LOOP
            INSERT INTO ronda (id_torneo, numero_ronda) VALUES (v_torneo_id, j);
        END LOOP;
    END LOOP;

END $$;

-- 7. Refrescar la vista materializada
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_top_50;
