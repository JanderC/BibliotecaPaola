-- Datos iniciales del sistema

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('dias_prestamo_default', '15', 'Días por defecto para préstamos'),
('multa_por_dia', '1.00', 'Multa por día de retraso'),
('max_libros_usuario', '3', 'Máximo de libros por usuario'),
('nombre_biblioteca', 'Biblioteca Central', 'Nombre de la biblioteca'),
('direccion_biblioteca', 'Calle Principal #123', 'Dirección de la biblioteca'),
('telefono_biblioteca', '+1234567890', 'Teléfono de la biblioteca');

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@biblioteca.com', crypt('admin123', gen_salt('bf')), 'administrador');

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion) VALUES
('Ficción', 'Novelas y cuentos de ficción'),
('No Ficción', 'Libros informativos y educativos'),
('Ciencia', 'Libros de ciencias exactas y naturales'),
('Historia', 'Libros de historia y biografías'),
('Tecnología', 'Libros de informática y tecnología'),
('Arte', 'Libros de arte, música y cultura'),
('Educación', 'Libros educativos y académicos'),
('Infantil', 'Libros para niños y jóvenes');

-- Insertar algunos libros de ejemplo
INSERT INTO libros (titulo, autor, isbn, categoria_id, editorial, año_publicacion, numero_paginas, cantidad_total, cantidad_disponible, ubicacion) VALUES
('Cien años de soledad', 'Gabriel García Márquez', '978-0307474728', 
 (SELECT id FROM categorias WHERE nombre = 'Ficción'), 'Editorial Sudamericana', 1967, 417, 3, 3, 'A-001'),
('El Quijote', 'Miguel de Cervantes', '978-8424116859', 
 (SELECT id FROM categorias WHERE nombre = 'Ficción'), 'Planeta', 1605, 863, 2, 2, 'A-002'),
('Breve historia del tiempo', 'Stephen Hawking', '978-0553380163', 
 (SELECT id FROM categorias WHERE nombre = 'Ciencia'), 'Bantam Books', 1988, 256, 2, 2, 'C-001');
