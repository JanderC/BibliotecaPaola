-- Script para crear la base de datos del sistema de biblioteca
-- Ejecutar como superusuario de PostgreSQL

-- Crear la base de datos
CREATE DATABASE biblioteca_system;

-- Conectar a la base de datos
\c biblioteca_system;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
