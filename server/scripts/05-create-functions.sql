-- Funciones y triggers para el sistema

-- Función para actualizar cantidad disponible de libros
CREATE OR REPLACE FUNCTION actualizar_disponibilidad_libro()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Nuevo préstamo
        UPDATE libros 
        SET cantidad_disponible = cantidad_disponible - 1 
        WHERE id = NEW.libro_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Devolución de libro
        IF OLD.estado = 'activo' AND NEW.estado = 'devuelto' THEN
            UPDATE libros 
            SET cantidad_disponible = cantidad_disponible + 1 
            WHERE id = NEW.libro_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar disponibilidad
CREATE TRIGGER trigger_actualizar_disponibilidad
    AFTER INSERT OR UPDATE ON prestamos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_disponibilidad_libro();

-- Función para registrar historial
CREATE OR REPLACE FUNCTION registrar_historial_prestamo()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historial_prestamos (prestamo_id, accion, detalles)
        VALUES (NEW.id, 'CREADO', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO historial_prestamos (prestamo_id, accion, detalles)
        VALUES (NEW.id, 'ACTUALIZADO', jsonb_build_object('anterior', row_to_json(OLD), 'nuevo', row_to_json(NEW)));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para historial
CREATE TRIGGER trigger_historial_prestamos
    AFTER INSERT OR UPDATE ON prestamos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historial_prestamo();
