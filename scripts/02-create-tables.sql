-- Script para crear las tablas del sistema de biblioteca

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'administrador')),
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP
);

-- Tabla de categorías de libros
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de libros
CREATE TABLE libros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    categoria_id UUID REFERENCES categorias(id),
    editorial VARCHAR(100),
    año_publicacion INTEGER,
    numero_paginas INTEGER,
    cantidad_total INTEGER DEFAULT 1,
    cantidad_disponible INTEGER DEFAULT 1,
    ubicacion VARCHAR(50),
    descripcion TEXT,
    imagen_url VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Tabla de préstamos
CREATE TABLE prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    libro_id UUID REFERENCES libros(id),
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_esperada DATE NOT NULL,
    fecha_devolucion_real TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'devuelto', 'vencido')),
    observaciones TEXT,
    multa DECIMAL(10,2) DEFAULT 0.00
);

-- Tabla de historial de préstamos (para auditoría)
CREATE TABLE historial_prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestamo_id UUID REFERENCES prestamos(id),
    accion VARCHAR(50) NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_accion UUID REFERENCES usuarios(id),
    detalles JSONB
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
