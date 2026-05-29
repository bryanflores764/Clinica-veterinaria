create database vetcare;
use vetcare;





-- 1. TABLAS BASE (sin dependencias)

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (Nombre_Rol) VALUES
('Administrador'),
('Veterinario'),
('Recepcionista');



-- TABLA DE USUARIOS
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Usuario VARCHAR(250) NOT NULL,
  Correo VARCHAR(150) NOT NULL UNIQUE,
  Contrasena VARCHAR(255) NOT NULL,
  RolId INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (RolId) REFERENCES roles(id)
);

-- TABLA DE PERMISOS
CREATE TABLE permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  RolId INT NOT NULL,
  Modulo VARCHAR(100) NOT NULL,
  Puede_Crear BOOLEAN DEFAULT FALSE,
  Puede_Leer BOOLEAN DEFAULT FALSE,
  Puede_Editar BOOLEAN DEFAULT FALSE,
  Puede_Eliminar BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (RolId) REFERENCES roles(id)
);

-- PERMISOS DEL ADMINISTRADOR
INSERT INTO permisos (RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar)
VALUES 
(1,'Permisos',1,1,1,1);

-- ELIMINAR USUARIO
DELETE FROM usuarios WHERE id = 2;

-- MOSTRAR TABLAS
SHOW TABLES;

-- CONSULTAS
SELECT * FROM roles;
SELECT * FROM permisos;
SELECT * FROM usuarios;

CREATE TABLE categorias (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Categoria VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE especies (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Especie VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estadocita (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estadosfactura (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE tipoconsulta (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Tipo_Consulta VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tiposdocumento (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Tipo_Documento VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE medicamentos (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre_Medicamento VARCHAR(150) NOT NULL
);

-- 2. TABLAS INTERMEDIAS

CREATE TABLE propietarios (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(150) NOT NULL,
  Telefono VARCHAR(20),
  Correo VARCHAR(150) UNIQUE,
  Direccion VARCHAR(250),
  Estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo'
);


CREATE TABLE razas (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Especie INT NOT NULL,
  Nombre_Raza VARCHAR(100) NOT NULL,
  FOREIGN KEY (Id_Especie) REFERENCES especies(Id)
);

-- 3. TABLAS DEPENDIENTES

CREATE TABLE mascotas (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Propietario INT NOT NULL,
  Id_Raza INT NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Fecha_Nacimiento DATE,
  Peso DECIMAL(5,2),
  Color VARCHAR(50),
  FOREIGN KEY (Id_Propietario) REFERENCES propietarios(Id),
  FOREIGN KEY (Id_Raza) REFERENCES razas(Id)
);

CREATE TABLE clientesfacturacion (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Propietario INT NOT NULL,
  NombreFiscal VARCHAR(150) NOT NULL,
  NIT VARCHAR(30) NOT NULL UNIQUE,
  NRC VARCHAR(30) NOT NULL UNIQUE,
  DUI VARCHAR(20) NOT NULL UNIQUE,
  DireccionFiscal VARCHAR(250) NOT NULL,
  Correo VARCHAR(150) NOT NULL UNIQUE,
  FOREIGN KEY (Id_Propietario) REFERENCES propietarios(Id)
);

CREATE TABLE productos (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Categoria INT NOT NULL,
  Nombre_Producto VARCHAR(150) NOT NULL,
  Precio DECIMAL(10,2) NOT NULL,
  Stock INT NOT NULL DEFAULT 0,
  FOREIGN KEY (Id_Categoria) REFERENCES categorias(Id)
);

CREATE TABLE ventas (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Propietario INT NOT NULL,
  Fecha_Venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_Propietario) REFERENCES propietarios(Id)
);

-- 4. TABLAS RELACIONADAS

CREATE TABLE citas (
  IdCita INT AUTO_INCREMENT PRIMARY KEY,
  Id_Mascota INT NOT NULL,
  Id_Veterinario INT NOT NULL,
  IdTipoConsulta INT NOT NULL,
  IdEstadoCita INT NOT NULL,
  FechaHora DATETIME NOT NULL,
  FOREIGN KEY (Id_Mascota) REFERENCES mascotas(Id),
  FOREIGN KEY (Id_Veterinario) REFERENCES usuarios(id),
  FOREIGN KEY (IdEstadoCita) REFERENCES estadocita(Id),
  FOREIGN KEY (IdTipoConsulta) REFERENCES tipoconsulta(Id)
);

CREATE TABLE historialclinico (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Mascota INT NOT NULL,
  Fecha_Consulta DATETIME NOT NULL,
  Motivo_Consulta VARCHAR(250),
  Diagnostico VARCHAR(500),
  Peso_Actual DECIMAL(5,2),
  Proxima_Cita DATE,
  FOREIGN KEY (Id_Mascota) REFERENCES mascotas(Id)
);

CREATE TABLE historial_medicamentos (
  Id_Historial INT NOT NULL,
  Id_Medicamento INT NOT NULL,
  Dosis VARCHAR(100),
  PRIMARY KEY (Id_Historial, Id_Medicamento),
  FOREIGN KEY (Id_Historial) REFERENCES historialclinico(Id),
  FOREIGN KEY (Id_Medicamento) REFERENCES medicamentos(Id)
);

CREATE TABLE detalleventa (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Venta INT NOT NULL,
  Id_Producto INT NOT NULL,
  Cantidad INT NOT NULL,
  Precio_Unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (Id_Venta) REFERENCES ventas(Id),
  FOREIGN KEY (Id_Producto) REFERENCES productos(Id)
);

CREATE TABLE facturaelectronica (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Venta INT NOT NULL,
  Id_Cliente INT NOT NULL,
  Id_TipoDocumento INT NOT NULL,
  Id_EstadoFactura INT NOT NULL,
  NumeroControl VARCHAR(50),
  CodigoGeneracion VARCHAR(100),
  SelloRecepcion VARCHAR(200),
  FechaEmision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_Venta) REFERENCES ventas(Id),
  FOREIGN KEY (Id_Cliente) REFERENCES clientesfacturacion(Id),
  FOREIGN KEY (Id_TipoDocumento) REFERENCES tiposdocumento(Id),
  FOREIGN KEY (Id_EstadoFactura) REFERENCES estadosfactura(Id)
);

INSERT INTO estadocita (Id, Estado) VALUES 
(1, 'Pendiente'),
(2, 'En Curso'),
(3, 'Cancelada'),
(4, 'Completada');

-- 4. Insertamos tipos de consulta base
INSERT INTO tipoconsulta (Id, Tipo_Consulta) VALUES 
(1, 'Consulta General'),
(2, 'Vacunación'),
(3, 'Control'),
(4 ,'cirujia');


-- 3. Verificamos que todo se guardó bien
SELECT * FROM citas;
SELECT * FROM tipoconsulta;
SELECT * FROM tipoconsulta;

ALTER TABLE razas DROP FOREIGN KEY razas_ibfk_1;

ALTER TABLE razas
ADD CONSTRAINT razas_ibfk_1
FOREIGN KEY (Id_Especie)
REFERENCES especies(Id)
ON DELETE CASCADE;

ALTER TABLE mascotas DROP FOREIGN KEY mascotas_ibfk_1;
ALTER TABLE mascotas DROP FOREIGN KEY mascotas_ibfk_2;

ALTER TABLE mascotas
ADD CONSTRAINT mascotas_ibfk_1
FOREIGN KEY (Id_Propietario)
REFERENCES propietarios(Id)
ON DELETE CASCADE;

ALTER TABLE mascotas
ADD CONSTRAINT mascotas_ibfk_2
FOREIGN KEY (Id_Raza)
REFERENCES razas(Id)
ON DELETE CASCADE;


ALTER TABLE citas DROP FOREIGN KEY citas_ibfk_1;
ALTER TABLE citas DROP FOREIGN KEY citas_ibfk_2;
ALTER TABLE citas DROP FOREIGN KEY citas_ibfk_3;
ALTER TABLE citas DROP FOREIGN KEY citas_ibfk_4;

ALTER TABLE citas
ADD CONSTRAINT citas_ibfk_1
FOREIGN KEY (Id_Mascota)
REFERENCES mascotas(Id)
ON DELETE CASCADE;

ALTER TABLE citas
ADD CONSTRAINT citas_ibfk_2
FOREIGN KEY (Id_Veterinario)
REFERENCES usuarios(id)
ON DELETE CASCADE;

ALTER TABLE citas
ADD CONSTRAINT citas_ibfk_3
FOREIGN KEY (IdEstadoCita)
REFERENCES estadocita(Id)
ON DELETE CASCADE;

ALTER TABLE citas
ADD CONSTRAINT citas_ibfk_4
FOREIGN KEY (IdTipoConsulta)
REFERENCES tipoconsulta(Id)
ON DELETE CASCADE;

ALTER TABLE historialclinico DROP FOREIGN KEY historialclinico_ibfk_1;

ALTER TABLE historialclinico
ADD CONSTRAINT historialclinico_ibfk_1
FOREIGN KEY (Id_Mascota)
REFERENCES mascotas(Id)
ON DELETE CASCADE;

ALTER TABLE historial_medicamentos DROP FOREIGN KEY historial_medicamentos_ibfk_1;
ALTER TABLE historial_medicamentos DROP FOREIGN KEY historial_medicamentos_ibfk_2;

ALTER TABLE historial_medicamentos
ADD CONSTRAINT historial_medicamentos_ibfk_1
FOREIGN KEY (Id_Historial)
REFERENCES historialclinico(Id)
ON DELETE CASCADE;

ALTER TABLE historial_medicamentos
ADD CONSTRAINT historial_medicamentos_ibfk_2
FOREIGN KEY (Id_Medicamento)
REFERENCES medicamentos(Id)
ON DELETE CASCADE;

ALTER TABLE clientesfacturacion DROP FOREIGN KEY clientesfacturacion_ibfk_1;

ALTER TABLE clientesfacturacion
ADD CONSTRAINT clientesfacturacion_ibfk_1
FOREIGN KEY (Id_Propietario)
REFERENCES propietarios(Id)
ON DELETE CASCADE;

ALTER TABLE productos DROP FOREIGN KEY productos_ibfk_1;

ALTER TABLE productos
ADD CONSTRAINT productos_ibfk_1
FOREIGN KEY (Id_Categoria)
REFERENCES categorias(Id)
ON DELETE CASCADE;

ALTER TABLE ventas DROP FOREIGN KEY ventas_ibfk_1;

ALTER TABLE ventas
ADD CONSTRAINT ventas_ibfk_1
FOREIGN KEY (Id_Propietario)
REFERENCES propietarios(Id)
ON DELETE CASCADE;

ALTER TABLE detalleventa DROP FOREIGN KEY detalleventa_ibfk_1;
ALTER TABLE detalleventa DROP FOREIGN KEY detalleventa_ibfk_2;

ALTER TABLE detalleventa
ADD CONSTRAINT detalleventa_ibfk_1
FOREIGN KEY (Id_Venta)
REFERENCES ventas(Id)
ON DELETE CASCADE;

ALTER TABLE detalleventa
ADD CONSTRAINT detalleventa_ibfk_2
FOREIGN KEY (Id_Producto)
REFERENCES productos(Id)
ON DELETE CASCADE;

ALTER TABLE facturaelectronica DROP FOREIGN KEY facturaelectronica_ibfk_1;
ALTER TABLE facturaelectronica DROP FOREIGN KEY facturaelectronica_ibfk_2;
ALTER TABLE facturaelectronica DROP FOREIGN KEY facturaelectronica_ibfk_3;
ALTER TABLE facturaelectronica DROP FOREIGN KEY facturaelectronica_ibfk_4;

ALTER TABLE facturaelectronica
ADD CONSTRAINT facturaelectronica_ibfk_1
FOREIGN KEY (Id_Venta)
REFERENCES ventas(Id)
ON DELETE CASCADE;

ALTER TABLE facturaelectronica
ADD CONSTRAINT facturaelectronica_ibfk_2
FOREIGN KEY (Id_Cliente)
REFERENCES clientesfacturacion(Id)
ON DELETE CASCADE;

ALTER TABLE facturaelectronica
ADD CONSTRAINT facturaelectronica_ibfk_3
FOREIGN KEY (Id_TipoDocumento)
REFERENCES tiposdocumento(Id)
ON DELETE CASCADE;

ALTER TABLE facturaelectronica
ADD CONSTRAINT facturaelectronica_ibfk_4
FOREIGN KEY (Id_EstadoFactura)
REFERENCES estadosfactura(Id)
ON DELETE CASCADE;


-- ============================================================
--  INSERT: Categorías
-- ============================================================
use vetcare;
INSERT INTO categorias (Nombre_Categoria) VALUES
  ('Medicamentos'),
  ('Vacunas'),
  ('Alimentos'),
  ('Accesorios'),
  ('Higiene y Cuidado');


-- ============================================================
--  INSERT: Productos
-- ============================================================

-- Categoría 1 - Medicamentos
INSERT INTO productos (Id_Categoria, Nombre_Producto, Precio, Stock) VALUES
  (1, 'Amoxicilina 250mg (frasco 30 cápsulas)',     85.00,  50),
  (1, 'Metronidazol 500mg (frasco 20 tabletas)',     65.00,  40),
  (1, 'Ivermectina 1% solución inyectable 50ml',   120.00,  30),
  (1, 'Dexametasona 2mg/ml inyectable 10ml',        95.00,  25),
  (1, 'Antiparasitario interno (caja 4 tabletas)',   55.00,  60);

-- Categoría 2 - Vacunas
INSERT INTO productos (Id_Categoria, Nombre_Producto, Precio, Stock) VALUES
  (2, 'Vacuna Antirrábica canina',                 150.00,  80),
  (2, 'Vacuna Pentavalente canina',                200.00,  60),
  (2, 'Vacuna Triple Felina',                      180.00,  45),
  (2, 'Vacuna Leucemia Felina',                    220.00,  30),
  (2, 'Vacuna Leptospirosis canina',               160.00,  50);

-- Categoría 3 - Alimentos
INSERT INTO productos (Id_Categoria, Nombre_Producto, Precio, Stock) VALUES
  (3, 'Royal Canin Adulto 15kg',                   550.00,  20),
  (3, 'Purina Pro Plan Cachorro 3kg',              280.00,  35),
  (3, 'Hills Science Diet Gato Adulto 4kg',        320.00,  25),
  (3, 'Pedigree Adulto razas pequeñas 8kg',        210.00,  40),
  (3, 'Whiskas Atún adulto 1.5kg',                 130.00,  50);

-- Categoría 4 - Accesorios
INSERT INTO productos (Id_Categoria, Nombre_Producto, Precio, Stock) VALUES
  (4, 'Collar antipulgas ajustable (perro)',        75.00,  60),
  (4, 'Correa retráctil 5m',                       120.00,  30),
  (4, 'Cama ortopédica para perro mediano',        350.00,  15),
  (4, 'Bebedero automático 1.5L',                  185.00,  20),
  (4, 'Transportadora rígida tamaño M',            420.00,  10);

-- Categoría 5 - Higiene y Cuidado
INSERT INTO productos (Id_Categoria, Nombre_Producto, Precio, Stock) VALUES
  (5, 'Shampoo antipulgas 500ml',                   90.00,  45),
  (5, 'Cepillo dental + pasta sabor pollo',         65.00,  50),
  (5, 'Toallitas húmedas para mascotas (50 uds)',   55.00,  70),
  (5, 'Cortauñas profesional acero inoxidable',     80.00,  35),
  (5, 'Perfume para mascotas 120ml',                70.00,  40);
  
  
select * from categorias ;
select * from productos ;
select * from propietarios ;
select * from usuarios ;
select * from categorias;
   ALTER TABLE ventas
  ADD COLUMN Estado ENUM('activa', 'confirmada', 'anulada') NOT NULL DEFAULT 'activa';
  
  -- ============================================================
--  SCRIPT: Actualización BD VetCare
--  Solo ALTER y CREATE — no toca datos existentes
-- ============================================================

USE vetcare;

-- ============================================================
--  #215-#216 Agregar descripcion y estado a productos
-- ============================================================

ALTER TABLE productos
  ADD COLUMN Descripcion  VARCHAR(300)                        NULL    AFTER Nombre_Producto,
  ADD COLUMN Estado       ENUM('activo','inactivo') NOT NULL  DEFAULT 'activo' AFTER Stock;


-- ============================================================
--  #255 Agregar columna Estado ya estaba, solo confirmar
--  #269-#271 Estado inactivo en lugar de eliminar → ya cubierto con el ENUM
-- ============================================================


-- ============================================================
--  #283-#284 / #311-#313 Agregar Total y Estado a ventas
--  #338-#340 Agregar Anulado_Por y Fecha_Anulacion a ventas
-- ============================================================

-- Primero agrega solo las columnas que faltan
ALTER TABLE ventas
  ADD COLUMN Total           DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER Fecha_Venta,
  ADD COLUMN Anulado_Por     INT           NULL AFTER Estado,
  ADD COLUMN Fecha_Anulacion DATETIME      NULL AFTER Anulado_Por;

-- Luego agrega el FK por separado
ALTER TABLE ventas
  ADD CONSTRAINT fk_ventas_anulado_por
  FOREIGN KEY (Anulado_Por) REFERENCES usuarios(id) ON DELETE SET NULL;


-- ============================================================
--  #256-#258 / #351-#354 Crear tabla MovimientosStock
-- ============================================================

CREATE TABLE IF NOT EXISTS movimientosstock (
  Id            INT AUTO_INCREMENT PRIMARY KEY,
  Id_Producto   INT          NOT NULL,
  Id_Venta      INT          NULL,                      -- NULL si es ajuste manual
  Id_Usuario    INT          NOT NULL,
  Tipo          ENUM('entrada','salida') NOT NULL,
  Cantidad      INT          NOT NULL,
  Stock_Antes   INT          NOT NULL,
  Stock_Despues INT          NOT NULL,
  Fecha         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_Producto) REFERENCES productos(Id)  ON DELETE CASCADE,
  FOREIGN KEY (Id_Venta)    REFERENCES ventas(Id)      ON DELETE SET NULL,
  FOREIGN KEY (Id_Usuario)  REFERENCES usuarios(id)    ON DELETE CASCADE
);


-- 1. Tabla historial_clinico
CREATE TABLE IF NOT EXISTS historial_clinico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT NOT NULL,
  fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(300) NOT NULL,
  diagnostico_inicial VARCHAR(500),
  observaciones TEXT,
  veterinario_id INT NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(Id) ON DELETE CASCADE,
  FOREIGN KEY (veterinario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_mascota (mascota_id),
  INDEX idx_estado (estado)
);

-- 2. Tabla consultas_medicas
CREATE TABLE IF NOT EXISTS consultas_medicas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  historial_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sintomas VARCHAR(500),
  diagnostico VARCHAR(500) NOT NULL,
  tratamiento TEXT,
  observaciones TEXT,
  veterinario_id INT NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (historial_id) REFERENCES historial_clinico(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_historial (historial_id),
  INDEX idx_fecha (fecha)
);

-- 3. Tabla vacunas_aplicadas
CREATE TABLE IF NOT EXISTS vacunas_aplicadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT NOT NULL,
  nombre_vacuna VARCHAR(150) NOT NULL,
  fecha_aplicacion DATE NOT NULL,
  proxima_dosis DATE,
  lote VARCHAR(50),
  observaciones TEXT,
  veterinario_id INT NOT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(Id) ON DELETE CASCADE,
  FOREIGN KEY (veterinario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_mascota (mascota_id),
  INDEX idx_proxima_dosis (proxima_dosis)
);

-- 4. Tabla auditoria_acciones
CREATE TABLE IF NOT EXISTS auditoria_acciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  accion VARCHAR(50) NOT NULL,
  descripcion TEXT,
  ip VARCHAR(45),
  referencia_id INT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_modulo (modulo),
  INDEX idx_fecha (fecha)
);

-- 5. Tabla notificaciones_vacunas (opcional)
CREATE TABLE IF NOT EXISTS notificaciones_vacunas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacuna_id INT NOT NULL,
  propietario_id INT NOT NULL,
  notificado BOOLEAN DEFAULT FALSE,
  fecha_notificacion DATETIME,
  FOREIGN KEY (vacuna_id) REFERENCES vacunas_aplicadas(id) ON DELETE CASCADE,
  FOREIGN KEY (propietario_id) REFERENCES propietarios(Id) ON DELETE CASCADE,
  INDEX idx_vacuna (vacuna_id),
  INDEX idx_notificado (notificado)
);


-- ============================================================
--  NUEVAS TABLAS Y MODIFICACIONES PARA REPORTES
--  Agregar al final del script de base de datos
-- ============================================================

USE vetcare;

-- ============================================================
--  TABLA: reportes_generados (#516)
-- ============================================================

CREATE TABLE IF NOT EXISTS reportes_generados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_reporte VARCHAR(50) NOT NULL,
    parametros TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    total_registros INT,
    archivo_nombre VARCHAR(255),
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_tipo_reporte (tipo_reporte),
    INDEX idx_usuario_reporte (usuario_id, fecha_generacion)
);

-- ============================================================
--  VISTAS PARA REPORTES (#465, #474, #495, #496)
-- ============================================================

-- Vista de ingresos diarios (#465)
CREATE OR REPLACE VIEW vista_ingresos_diarios AS
SELECT 
    DATE(v.Fecha_Venta) AS fecha,
    COUNT(DISTINCT v.Id) AS total_ventas,
    SUM(v.Total) AS ingresos_totales,
    COUNT(DISTINCT v.Id_Propietario) AS clientes_atendidos
FROM ventas v
WHERE v.Estado = 'confirmada'
GROUP BY DATE(v.Fecha_Venta)
ORDER BY fecha DESC;

-- Vista de ingresos mensuales (#465)
CREATE OR REPLACE VIEW vista_ingresos_mensuales AS
SELECT 
    YEAR(v.Fecha_Venta) AS año,
    MONTH(v.Fecha_Venta) AS mes,
    COUNT(DISTINCT v.Id) AS total_ventas,
    SUM(v.Total) AS ingresos_totales
FROM ventas v
WHERE v.Estado = 'confirmada'
GROUP BY YEAR(v.Fecha_Venta), MONTH(v.Fecha_Venta)
ORDER BY año DESC, mes DESC;

-- Vista de transacciones (#474)
CREATE OR REPLACE VIEW vista_transacciones AS
SELECT 
    v.Id AS venta_id,
    v.Fecha_Venta AS fecha,
    v.Total AS monto,
    v.Estado AS estado_venta,
    p.Nombre AS propietario,
    p.Telefono,
    p.Correo,
    COUNT(d.Id) AS total_productos,
    GROUP_CONCAT(DISTINCT pr.Nombre_Producto SEPARATOR ', ') AS productos
FROM ventas v
INNER JOIN propietarios p ON p.Id = v.Id_Propietario
INNER JOIN detalleventa d ON d.Id_Venta = v.Id
INNER JOIN productos pr ON pr.Id = d.Id_Producto
WHERE v.Estado = 'confirmada'
GROUP BY v.Id
ORDER BY v.Fecha_Venta DESC;

-- Vista de productos más vendidos (#495, #496)
CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT 
    pr.Id AS producto_id,
    pr.Nombre_Producto AS producto,
    c.Nombre_Categoria AS categoria,
    SUM(d.Cantidad) AS total_unidades_vendidas,
    SUM(d.Cantidad * d.Precio_Unitario) AS total_ingresos,
    COUNT(DISTINCT v.Id) AS num_ventas
FROM productos pr
INNER JOIN detalleventa d ON d.Id_Producto = pr.Id
INNER JOIN ventas v ON v.Id = d.Id_Venta
INNER JOIN categorias c ON c.Id = pr.Id_Categoria
WHERE v.Estado = 'confirmada'
GROUP BY pr.Id, pr.Nombre_Producto, c.Nombre_Categoria
ORDER BY total_unidades_vendidas DESC;

-- Vista de ventas con detalle completo (#496)
CREATE OR REPLACE VIEW vista_ventas_detalle AS
SELECT 
    v.Id AS venta_id,
    v.Fecha_Venta,
    v.Total AS venta_total,
    p.Nombre AS propietario,
    pr.Id AS producto_id,
    pr.Nombre_Producto AS producto,
    d.Cantidad,
    d.Precio_Unitario,
    (d.Cantidad * d.Precio_Unitario) AS subtotal
FROM ventas v
INNER JOIN propietarios p ON p.Id = v.Id_Propietario
INNER JOIN detalleventa d ON d.Id_Venta = v.Id
INNER JOIN productos pr ON pr.Id = d.Id_Producto
WHERE v.Estado = 'confirmada';

-- Vista de reportes por usuario (#517)
CREATE OR REPLACE VIEW vista_reportes_usuario AS
SELECT 
    rg.id,
    rg.tipo_reporte,
    rg.parametros,
    rg.fecha_inicio,
    rg.fecha_fin,
    rg.total_registros,
    rg.archivo_nombre,
    rg.fecha_generacion,
    u.Nombre_Usuario AS generado_por
FROM reportes_generados rg
INNER JOIN usuarios u ON u.id = rg.usuario_id
ORDER BY rg.fecha_generacion DESC;

-- ============================================================
--  ÍNDICES PARA OPTIMIZAR REPORTES (#466, #486)
-- ============================================================

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_estado ON ventas(Fecha_Venta, Estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(Fecha_Venta);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_estado_total ON ventas(Fecha_Venta, Estado, Total);
CREATE INDEX IF NOT EXISTS idx_ventas_propietario ON ventas(Id_Propietario, Estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_propietario ON ventas(Fecha_Venta, Id_Propietario);

-- Índices para detalleventa
CREATE INDEX IF NOT EXISTS idx_detalle_venta ON detalleventa(Id_Venta, Id_Producto);
CREATE INDEX IF NOT EXISTS idx_detalle_producto ON detalleventa(Id_Producto, Id_Venta);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_producto_cantidad ON detalleventa(Id_Venta, Id_Producto, Cantidad);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(Id_Categoria, Estado);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(Estado);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(Nombre_Producto);

-- Índices para reportes_generados
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes_generados(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes_generados(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_fecha ON reportes_generados(usuario_id, fecha_generacion);

-- ============================================================
--  PROCEDIMIENTOS ALMACENADOS PARA REPORTES (#484)
-- ============================================================

DELIMITER //

-- Procedimiento para reporte de ventas por fechas
CREATE OR REPLACE PROCEDURE sp_reporte_ventas_fechas(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(v.Fecha_Venta) AS fecha,
        COUNT(v.Id) AS num_ventas,
        SUM(v.Total) AS total_ingresos,
        AVG(v.Total) AS promedio_venta,
        SUM(CASE WHEN v.Estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
        SUM(CASE WHEN v.Estado = 'anulada' THEN 1 ELSE 0 END) AS anuladas
    FROM ventas v
    WHERE DATE(v.Fecha_Venta) BETWEEN p_fecha_inicio AND p_fecha_fin
    AND v.Estado IN ('confirmada', 'anulada')
    GROUP BY DATE(v.Fecha_Venta)
    ORDER BY fecha;
END //

-- Procedimiento para top productos por período
CREATE OR REPLACE PROCEDURE sp_top_productos(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    IN p_limit INT
)
BEGIN
    SELECT 
        pr.Nombre_Producto,
        SUM(d.Cantidad) AS total_vendido,
        SUM(d.Cantidad * d.Precio_Unitario) AS ingresos
    FROM productos pr
    INNER JOIN detalleventa d ON d.Id_Producto = pr.Id
    INNER JOIN ventas v ON v.Id = d.Id_Venta
    WHERE v.Estado = 'confirmada'
    AND DATE(v.Fecha_Venta) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY pr.Id, pr.Nombre_Producto
    ORDER BY total_vendido DESC
    LIMIT p_limit;
END //

DELIMITER ;

-- ============================================================
--  FUNCIONES PARA REPORTES (#485, #506)
-- ============================================================

DELIMITER //

-- Función para validar formato de fecha (#485)
CREATE OR REPLACE FUNCTION fn_validar_fecha(fecha_str VARCHAR(20))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN fecha_str REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';
END //

-- Función para calcular ingresos por período (#506)
CREATE OR REPLACE FUNCTION fn_ingresos_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(Total), 0) INTO total
    FROM ventas
    WHERE Estado = 'confirmada'
    AND DATE(Fecha_Venta) BETWEEN p_fecha_inicio AND p_fecha_fin;
    RETURN total;
END //

DELIMITER ;

-- ============================================================
--  VERIFICACIÓN DE INTEGRIDAD (#475, #507)
-- ============================================================

-- Verificar ventas sin detalle
SELECT v.Id, v.Fecha_Venta, v.Total, v.Estado
FROM ventas v
LEFT JOIN detalleventa d ON d.Id_Venta = v.Id
WHERE d.Id IS NULL AND v.Estado = 'confirmada';

-- Verificar productos sin categoría
SELECT Id, Nombre_Producto, Id_Categoria
FROM productos
WHERE Id_Categoria IS NULL OR Id_Categoria NOT IN (SELECT Id FROM categorias);

-- Verificar ventas con total incorrecto
SELECT v.Id, v.Total AS total_guardado, SUM(d.Cantidad * d.Precio_Unitario) AS total_calculado
FROM ventas v
INNER JOIN detalleventa d ON d.Id_Venta = v.Id
WHERE v.Estado = 'confirmada'
GROUP BY v.Id
HAVING ABS(v.Total - total_calculado) > 0.01;

-- ============================================================
--  CONSULTA DE VALIDACIÓN DE DATOS EXPORTADOS (#507)
-- ============================================================

SELECT 
    'ventas' AS tabla,
    COUNT(*) AS total_registros,
    SUM(CASE WHEN Estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
    SUM(CASE WHEN Estado = 'anulada' THEN 1 ELSE 0 END) AS anuladas,
    COALESCE(SUM(Total), 0) AS ingresos_totales
FROM ventas
UNION ALL
SELECT 
    'productos' AS tabla,
    COUNT(*) AS total_registros,
    SUM(CASE WHEN Estado = 'activo' THEN 1 ELSE 0 END) AS activos,
    SUM(CASE WHEN Estado = 'inactivo' THEN 1 ELSE 0 END) AS inactivos,
    COUNT(DISTINCT Id_Categoria) AS categorias_utilizadas
FROM productos;

-- ============================================================
--  VERIFICACIÓN FINAL
-- ============================================================

-- Mostrar todas las tablas nuevas
SHOW TABLES LIKE 'reportes_generados';

-- Mostrar todas las vistas creadas
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Mostrar los índices creados en ventas
SHOW INDEX FROM ventas;
SHOW INDEX FROM detalleventa;
SHOW INDEX FROM productos;

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================

--- ============================================================
--  SCRIPT FINAL - FACTURACIÓN (VERSIÓN SIMPLIFICADA)
-- ============================================================

USE vetcare;

-- ============================================================
--  1. AGREGAR COLUMNAS A ventas
-- ============================================================
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS requiere_factura BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS correo_factura VARCHAR(150) NULL;

-- ============================================================
--  2. AGREGAR COLUMNAS A facturaelectronica
-- ============================================================
ALTER TABLE facturaelectronica
  ADD COLUMN IF NOT EXISTS RutaComprobante VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS IdentificadorComprobante VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS EstadoEnvio ENUM('pendiente', 'enviado', 'fallido') NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS FechaEnvio DATETIME NULL,
  ADD COLUMN IF NOT EXISTS MensajeError TEXT NULL,
  ADD COLUMN IF NOT EXISTS CorreoDestino VARCHAR(150) NULL;

-- ============================================================
--  3. ACTUALIZAR FOREIGN KEY (Id_Cliente → propietarios)
-- ============================================================
ALTER TABLE facturaelectronica DROP FOREIGN KEY IF EXISTS facturaelectronica_ibfk_2;
ALTER TABLE facturaelectronica DROP FOREIGN KEY IF EXISTS fk_factura_cliente;

ALTER TABLE facturaelectronica
  ADD CONSTRAINT fk_factura_cliente
  FOREIGN KEY (Id_Cliente) REFERENCES propietarios(Id) ON DELETE CASCADE;

-- ============================================================
--  4. TIPOS DE DOCUMENTO
-- ============================================================
DELETE FROM tiposdocumento WHERE Tipo_Documento = 'Credito Fiscal';

INSERT INTO tiposdocumento (Id, Tipo_Documento) VALUES (1, 'Factura Electronica')
ON DUPLICATE KEY UPDATE Tipo_Documento = VALUES(Tipo_Documento);

-- ============================================================
--  5. ELIMINAR TABLAS QUE YA NO SE USAN
-- ============================================================
DROP TABLE IF EXISTS clientesfacturacion;
DROP TABLE IF EXISTS estadosfactura;

-- ============================================================
--  6. VERIFICAR ESTRUCTURA FINAL
-- ============================================================
DESCRIBE ventas;
DESCRIBE facturaelectronica;
SELECT * FROM tiposdocumento;