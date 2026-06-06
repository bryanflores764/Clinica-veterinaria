DROP DATABASE IF EXISTS `vetcare2`;
CREATE DATABASE `vetcare2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vetcare2`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLAS BASE
-- ============================================

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_nombre` (`Nombre_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Usuario` varchar(250) NOT NULL,
  `Correo` varchar(150) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `RolId` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_correo` (`Correo`),
  KEY `idx_usuarios_rol` (`RolId`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `especies` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Especie` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_especies_nombre` (`Nombre_Especie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `razas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Especie` int NOT NULL,
  `Nombre_Raza` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_razas_especie` (`Id_Especie`),
  CONSTRAINT `fk_razas_especies` FOREIGN KEY (`Id_Especie`) REFERENCES `especies` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `propietarios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(150) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Correo` varchar(150) DEFAULT NULL,
  `Direccion` varchar(250) DEFAULT NULL,
  `Estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_propietarios_correo` (`Correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mascotas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Id_Raza` int NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Fecha_Nacimiento` date DEFAULT NULL,
  `Peso` decimal(5,2) DEFAULT NULL,
  `Color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_mascotas_propietario` (`Id_Propietario`),
  KEY `idx_mascotas_raza` (`Id_Raza`),
  CONSTRAINT `fk_mascotas_propietarios` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mascotas_razas` FOREIGN KEY (`Id_Raza`) REFERENCES `razas` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tipoconsulta` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Consulta` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_tipoconsulta_tipo` (`Tipo_Consulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `estadocita` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Estado` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_estadocita_estado` (`Estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categorias` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Categoria` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_categorias_nombre` (`Nombre_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tiposdocumento` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Documento` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_tiposdocumento_tipo` (`Tipo_Documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS RELACIONADAS
-- ============================================

CREATE TABLE `citas` (
  `IdCita` int NOT NULL AUTO_INCREMENT,
  `Id_Mascota` int NOT NULL,
  `Id_Veterinario` int NOT NULL,
  `IdTipoConsulta` int NOT NULL,
  `IdEstadoCita` int NOT NULL,
  `FechaHora` datetime NOT NULL,
  PRIMARY KEY (`IdCita`),
  UNIQUE KEY `idx_unique_vet_hora` (`Id_Veterinario`,`FechaHora`),
  KEY `idx_citas_mascota` (`Id_Mascota`),
  KEY `idx_citas_estado` (`IdEstadoCita`),
  KEY `idx_citas_tipo` (`IdTipoConsulta`),
  CONSTRAINT `fk_citas_mascotas` FOREIGN KEY (`Id_Mascota`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_veterinarios` FOREIGN KEY (`Id_Veterinario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_estados` FOREIGN KEY (`IdEstadoCita`) REFERENCES `estadocita` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_tipos` FOREIGN KEY (`IdTipoConsulta`) REFERENCES `tipoconsulta` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `productos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Categoria` int NOT NULL,
  `Nombre_Producto` varchar(150) NOT NULL,
  `Descripcion` varchar(300) DEFAULT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Stock` int NOT NULL DEFAULT 0,
  `Estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`Id`),
  KEY `idx_productos_categoria` (`Id_Categoria`,`Estado`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ventas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Fecha_Venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Metodo_Pago` enum('efectivo','tarjeta','transferencia') NOT NULL,
  `Monto_Recibido` decimal(10,2) DEFAULT NULL,
  `Cambio` decimal(10,2) DEFAULT NULL,
  `Estado` enum('activa','confirmada','anulada') NOT NULL DEFAULT 'activa',
  `Anulado_Por` int DEFAULT NULL,
  `Fecha_Anulacion` datetime DEFAULT NULL,
  `requiere_factura` tinyint(1) DEFAULT 0,
  `correo_factura` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_ventas_propietario` (`Id_Propietario`),
  KEY `idx_ventas_anulado_por` (`Anulado_Por`),
  CONSTRAINT `fk_ventas_propietarios` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_anulado_por` FOREIGN KEY (`Anulado_Por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalleventa` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Producto` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_detalle_venta_producto` (`Id_Venta`,`Id_Producto`),
  KEY `idx_detalle_producto` (`Id_Producto`),
  CONSTRAINT `fk_detalleventa_ventas` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalleventa_productos` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditoria_acciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `descripcion` text,
  `ip` varchar(45) DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_auditoria_usuario` (`usuario_id`),
  KEY `idx_auditoria_modulo` (`modulo`),
  KEY `idx_auditoria_fecha` (`fecha`),
  CONSTRAINT `fk_auditoria_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historial_clinico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mascota_id` int NOT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` varchar(300) NOT NULL,
  `diagnostico_inicial` varchar(500) DEFAULT NULL,
  `observaciones` text,
  `veterinario_id` int NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_historial_veterinario` (`veterinario_id`),
  KEY `idx_historial_mascota` (`mascota_id`),
  KEY `idx_historial_estado` (`estado`),
  CONSTRAINT `fk_historial_mascotas` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consultas_medicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historial_id` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sintomas` varchar(500) DEFAULT NULL,
  `diagnostico` varchar(500) NOT NULL,
  `tratamiento` text,
  `observaciones` text,
  `veterinario_id` int NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_consultas_veterinario` (`veterinario_id`),
  KEY `idx_consultas_historial` (`historial_id`),
  KEY `idx_consultas_fecha` (`fecha`),
  CONSTRAINT `fk_consultas_historial` FOREIGN KEY (`historial_id`) REFERENCES `historial_clinico` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consultas_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vacunas_aplicadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mascota_id` int NOT NULL,
  `nombre_vacuna` varchar(150) NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `proxima_dosis` date DEFAULT NULL,
  `lote` varchar(50) DEFAULT NULL,
  `observaciones` text,
  `veterinario_id` int NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vacunas_veterinario` (`veterinario_id`),
  KEY `idx_vacunas_mascota` (`mascota_id`),
  KEY `idx_vacunas_proxima_dosis` (`proxima_dosis`),
  CONSTRAINT `fk_vacunas_mascotas` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vacunas_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notificaciones_vacunas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vacuna_id` int NOT NULL,
  `propietario_id` int NOT NULL,
  `notificado` tinyint(1) DEFAULT 0,
  `fecha_notificacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_propietario` (`propietario_id`),
  KEY `idx_notificaciones_vacuna` (`vacuna_id`),
  KEY `idx_notificaciones_notificado` (`notificado`),
  CONSTRAINT `fk_notificaciones_vacunas` FOREIGN KEY (`vacuna_id`) REFERENCES `vacunas_aplicadas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notificaciones_propietarios` FOREIGN KEY (`propietario_id`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `movimientosstock` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Producto` int NOT NULL,
  `Id_Venta` int DEFAULT NULL,
  `Id_Usuario` int NOT NULL,
  `Tipo` enum('entrada','salida') NOT NULL,
  `Cantidad` int NOT NULL,
  `Stock_Antes` int NOT NULL,
  `Stock_Despues` int NOT NULL,
  `Fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_movstock_producto` (`Id_Producto`),
  KEY `idx_movstock_venta` (`Id_Venta`),
  KEY `idx_movstock_usuario` (`Id_Usuario`),
  CONSTRAINT `fk_movstock_productos` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movstock_ventas` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `fk_movstock_usuarios` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `facturaelectronica` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Cliente` int NOT NULL,
  `Id_TipoDocumento` int NOT NULL DEFAULT 1,
  `EstadoEnvio` enum('pendiente','enviado','fallido','no_enviar') NOT NULL DEFAULT 'pendiente',
  `CorreoDestino` varchar(150) DEFAULT NULL,
  `MensajeError` text,
  `FechaEnvio` datetime DEFAULT NULL,
  `IntentosEnvio` int DEFAULT 0,
  `NumeroControl` varchar(50) DEFAULT NULL,
  `CodigoGeneracion` varchar(100) DEFAULT NULL,
  `SelloRecepcion` varchar(200) DEFAULT NULL,
  `RutaComprobante` varchar(500) DEFAULT NULL,
  `IdentificadorComprobante` varchar(100) DEFAULT NULL,
  `FechaEmision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_factura_tipo_documento` (`Id_TipoDocumento`),
  KEY `idx_factura_identificador` (`IdentificadorComprobante`),
  KEY `idx_factura_estado_envio` (`EstadoEnvio`,`FechaEnvio`),
  KEY `idx_factura_venta` (`Id_Venta`),
  KEY `idx_factura_cliente` (`Id_Cliente`),
  CONSTRAINT `fk_factura_ventas` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_factura_clientes` FOREIGN KEY (`Id_Cliente`) REFERENCES `propietarios` (`Id`),
  CONSTRAINT `fk_factura_tiposdocumento` FOREIGN KEY (`Id_TipoDocumento`) REFERENCES `tiposdocumento` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reportes_generados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo_reporte` varchar(50) NOT NULL,
  `parametros` text,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `total_registros` int DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reportes_usuario` (`usuario_id`),
  KEY `idx_reportes_fecha_generacion` (`fecha_generacion`),
  KEY `idx_reportes_tipo` (`tipo_reporte`),
  CONSTRAINT `fk_reportes_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `RolId` int NOT NULL,
  `Modulo` varchar(100) NOT NULL,
  `Puede_Crear` tinyint(1) DEFAULT 0,
  `Puede_Leer` tinyint(1) DEFAULT 0,
  `Puede_Editar` tinyint(1) DEFAULT 0,
  `Puede_Eliminar` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_permisos_rol` (`RolId`),
  CONSTRAINT `fk_permisos_roles` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO `roles` (`id`, `Nombre_Rol`) VALUES 
(1, 'Administrador'),
(2, 'Veterinario'),
(3, 'Recepcionista');

INSERT INTO `usuarios` (`id`, `Nombre_Usuario`, `Correo`, `Contrasena`, `RolId`, `activo`) VALUES
(1, 'Administrador', 'admin@vetcare.com', '$2b$10$fm30kdq1nZffw7Jz0kUR1O418gyAMQUw67XlVJAhlSDcFkyS5QjgS', 1, 1);

INSERT INTO `estadocita` (`Id`, `Estado`) VALUES 
(1, 'Pendiente'),
(2, 'En Curso'),
(3, 'Cancelada'),
(4, 'Completada');

INSERT INTO `tipoconsulta` (`Id`, `Tipo_Consulta`) VALUES 
(1, 'Consulta General'),
(2, 'Vacunación'),
(3, 'Control'),
(4, 'Cirugía');

INSERT INTO `especies` (`Id`, `Nombre_Especie`) VALUES 
(1, 'Felino'),
(2, 'Canino');

INSERT INTO `razas` (`Id`, `Id_Especie`, `Nombre_Raza`) VALUES 
(1, 2, 'Cane Corso'),
(2, 1, 'Siamés');

INSERT INTO `categorias` (`Id`, `Nombre_Categoria`) VALUES 
(1, 'Medicamentos'),
(2, 'Vacunas'),
(3, 'Alimentos'),
(4, 'Accesorios'),
(5, 'Higiene y Cuidado');

INSERT INTO `tiposdocumento` (`Id`, `Tipo_Documento`) VALUES 
(1, 'Factura Electrónica');

INSERT INTO `permisos` (`RolId`, `Modulo`, `Puede_Crear`, `Puede_Leer`, `Puede_Editar`, `Puede_Eliminar`) VALUES
(1, 'Usuarios', 1, 1, 1, 1),
(1, 'Clientes', 1, 1, 1, 1),
(1, 'Mascotas', 1, 1, 1, 1),
(1, 'Citas', 1, 1, 1, 1),
(1, 'Productos', 1, 1, 1, 1),
(1, 'Ventas', 1, 1, 1, 1),
(1, 'Reportes', 1, 1, 1, 1),
(2, 'Mascotas', 0, 1, 1, 0),
(2, 'Citas', 0, 1, 1, 0),
(2, 'Historial Clinico', 1, 1, 1, 1),
(2, 'Vacunas', 1, 1, 1, 1),
(3, 'Clientes', 1, 1, 1, 0),
(3, 'Mascotas', 1, 1, 1, 0),
(3, 'Citas', 1, 1, 1, 0),
(3, 'Ventas', 1, 1, 1, 0);

-- ============================================
-- VERIFICACIÓN RÁPIDA
-- ============================================

SHOW TABLES;
SHOW INDEX FROM `citas` WHERE Key_name = 'idx_unique_vet_hora';
