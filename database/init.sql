-- Crear base de datos para inmobiliaria
CREATE DATABASE IF NOT EXISTS inmobiliaria_db;
USE inmobiliaria_db;

-- Tabla de tipos de propiedad
CREATE TABLE IF NOT EXISTS tipo_propiedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS propiedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_propiedad_id INT NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10),
    metros_cuadrados DECIMAL(10, 2),
    habitaciones INT,
    banos INT,
    estacionamientos INT,
    ano_construccion YEAR,
    estado_propiedad ENUM('venta', 'renta', 'vendida', 'rentada') DEFAULT 'venta',
    destacada BOOLEAN DEFAULT FALSE,
    imagen_principal VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_propiedad_id) REFERENCES tipo_propiedad(id)
);

-- Tabla de imágenes de propiedades
CREATE TABLE IF NOT EXISTS imagenes_propiedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propiedad_id INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);

-- Tabla de agentes/contactos
CREATE TABLE IF NOT EXISTS agentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
    cargo VARCHAR(100),
    biografia TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación agentes-propiedades
CREATE TABLE IF NOT EXISTS agente_propiedades (
    agente_id INT NOT NULL,
    propiedad_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agente_id, propiedad_id),
    FOREIGN KEY (agente_id) REFERENCES agentes(id) ON DELETE CASCADE,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);

-- Tabla de consultas/contactos
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propiedad_id INT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atendida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE SET NULL
);

-- Tabla de características
CREATE TABLE IF NOT EXISTS caracteristicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50)
);

-- Tabla de relación propiedades-características
CREATE TABLE IF NOT EXISTS propiedad_caracteristicas (
    propiedad_id INT NOT NULL,
    caracteristica_id INT NOT NULL,
    PRIMARY KEY (propiedad_id, caracteristica_id),
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    FOREIGN KEY (caracteristica_id) REFERENCES caracteristicas(id) ON DELETE CASCADE
);

-- Tabla de usuarios para autenticación
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('administrador', 'vendedor') DEFAULT 'vendedor',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar tipos de propiedad iniciales
INSERT INTO tipo_propiedad (nombre, descripcion) VALUES
('Casa', 'Casa unifamiliar'),
('Departamento', 'Departamento o apartamento'),
('Terreno', 'Terreno baldío'),
('Local Comercial', 'Local para negocio'),
('Oficina', 'Espacio de oficina'),
('Bodega', 'Espacio de almacenamiento');

-- Insertar características comunes
INSERT INTO caracteristicas (nombre, icono) VALUES
('Aire Acondicionado', 'ac_unit'),
('Calefacción', 'thermostat'),
('Jardín', 'yard'),
('Piscina', 'pool'),
('Seguridad 24/7', 'security'),
('Gimnasio', 'fitness_center'),
('Elevador', 'elevator'),
('Balcón', 'balcony'),
('Amueblado', 'chair'),
('Mascotas Permitidas', 'pets');

-- Insertar un agente de ejemplo
INSERT INTO agentes (nombre, apellido, email, telefono, cargo, biografia) VALUES
('Juan', 'Pérez', 'juan.perez@inmobiliaria.com', '555-0123', 'Agente Senior', 'Experto en bienes raíces con más de 10 años de experiencia.');

-- Insertar propiedades de ejemplo
INSERT INTO propiedades (titulo, descripcion, tipo_propiedad_id, precio, direccion, ciudad, estado, codigo_postal, metros_cuadrados, habitaciones, banos, estacionamientos, ano_construccion, estado_propiedad, destacada) 
VALUES 
('Casa Moderna en Zona Residencial', 'Hermosa casa de 3 niveles con acabados de lujo, cocina equipada y jardín amplio.', 1, 3500000.00, 'Av. Principal 123', 'Ciudad de México', 'CDMX', '01000', 250.00, 4, 3, 2, 2020, 'venta', TRUE),
('Departamento Céntrico Amueblado', 'Departamento completamente amueblado en zona céntrica, cerca de servicios y transporte.', 2, 2200000.00, 'Calle Reforma 456', 'Guadalajara', 'Jalisco', '44100', 95.00, 2, 2, 1, 2019, 'venta', TRUE),
('Terreno Comercial', 'Terreno ideal para desarrollo comercial, excelente ubicación.', 3, 1800000.00, 'Carretera Nacional km 5', 'Monterrey', 'Nuevo León', '64000', 500.00, 0, 0, 0, NULL, 'venta', FALSE);
