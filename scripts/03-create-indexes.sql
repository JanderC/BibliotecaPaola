-- Índices para optimizar consultas

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Índices para libros
CREATE INDEX idx_libros_titulo ON libros(titulo);
CREATE INDEX idx_libros_autor ON libros(autor);
CREATE INDEX idx_libros_isbn ON libros(isbn);
CREATE INDEX idx_libros_categoria ON libros(categoria_id);
CREATE INDEX idx_libros_activo ON libros(activo);

-- Índices para préstamos
CREATE INDEX idx_prestamos_usuario ON prestamos(usuario_id);
CREATE INDEX idx_prestamos_libro ON prestamos(libro_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_prestamos_fecha_prestamo ON prestamos(fecha_prestamo);
CREATE INDEX idx_prestamos_fecha_devolucion ON prestamos(fecha_devolucion_esperada);
