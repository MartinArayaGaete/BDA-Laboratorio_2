-- ============================================
-- 08-Triggers.sql
-- Triggers de validación de negocio y auditoría
-- ============================================

-- Trigger B: Límites de puntaje de flechas (0-10)
CREATE OR REPLACE FUNCTION limites_puntaje_flecha_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.puntaje < 0 OR NEW.puntaje > 10 THEN
        RAISE EXCEPTION 'Puntaje fuera de rango. Debe ser entre 0 y 10.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER limites_puntaje_flecha
BEFORE INSERT OR UPDATE ON flecha
FOR EACH ROW
EXECUTE FUNCTION limites_puntaje_flecha_fn();


-- Trigger C: Auditoría de modificaciones de puntajes
CREATE OR REPLACE FUNCTION audit_puntaje_fn()
RETURNS TRIGGER AS $$
DECLARE
    admin_id BIGINT;
    ronda_id BIGINT;
BEGIN
    -- Solo registrar si el puntaje final cambió
    IF OLD.puntaje_final IS DISTINCT FROM NEW.puntaje_final THEN
        -- Obtener variables de sesión configuradas por el SP
        admin_id := NULLIF(current_setting('my.user_id', true), '')::BIGINT;
        ronda_id := NULLIF(current_setting('my.ronda_id', true), '')::BIGINT;

        IF admin_id IS NULL THEN
            RAISE EXCEPTION 'No se configuró my.user_id para auditoría.';
        END IF;
        IF ronda_id IS NULL THEN
            RAISE EXCEPTION 'No se configuró my.ronda_id para auditoría.';
        END IF;

        -- Insertar registro de auditoría
        INSERT INTO logs (
            id_admin,
            id_afectado,
            torneo_afectado,
            ronda_afectada,
            puntaje_anterior,
            puntaje_nuevo
        )
        VALUES (
            admin_id,
            OLD.id_usuario,
            OLD.id_torneo,
            ronda_id,
            OLD.puntaje_final,
            NEW.puntaje_final
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_puntaje
AFTER UPDATE OF puntaje_final ON participacion
FOR EACH ROW
EXECUTE FUNCTION audit_puntaje_fn();