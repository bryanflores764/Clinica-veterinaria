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


