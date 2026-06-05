CREATE DATABASE IF NOT EXISTS `vetcare2` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE `vetcare2`;

-- ============================================
-- TABLAS
-- ============================================

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Nombre_Rol` (`Nombre_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Usuario` varchar(250) NOT NULL,
  `Correo` varchar(150) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `RolId` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Correo` (`Correo`),
  KEY `RolId` (`RolId`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `especies` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Especie` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nombre_Especie` (`Nombre_Especie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `razas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Especie` int NOT NULL,
  `Nombre_Raza` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `razas_ibfk_1` (`Id_Especie`),
  CONSTRAINT `razas_ibfk_1` FOREIGN KEY (`Id_Especie`) REFERENCES `especies` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `propietarios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(150) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Correo` varchar(150) DEFAULT NULL,
  `Direccion` varchar(250) DEFAULT NULL,
  `Estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Correo` (`Correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `mascotas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Id_Raza` int NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Fecha_Nacimiento` date DEFAULT NULL,
  `Peso` decimal(5,2) DEFAULT NULL,
  `Color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `mascotas_ibfk_1` (`Id_Propietario`),
  KEY `mascotas_ibfk_2` (`Id_Raza`),
  CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`Id_Raza`) REFERENCES `razas` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipoconsulta` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Consulta` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Tipo_Consulta` (`Tipo_Consulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `estadocita` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Estado` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Estado` (`Estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `citas` (
  `IdCita` int NOT NULL AUTO_INCREMENT,
  `Id_Mascota` int NOT NULL,
  `Id_Veterinario` int NOT NULL,
  `IdTipoConsulta` int NOT NULL,
  `IdEstadoCita` int NOT NULL,
  `FechaHora` datetime NOT NULL,
  PRIMARY KEY (`IdCita`),
  UNIQUE KEY `idx_unique_vet_hora` (`Id_Veterinario`,`FechaHora`),
  KEY `citas_ibfk_1` (`Id_Mascota`),
  KEY `citas_ibfk_3` (`IdEstadoCita`),
  KEY `citas_ibfk_4` (`IdTipoConsulta`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`Id_Mascota`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`Id_Veterinario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`IdEstadoCita`) REFERENCES `estadocita` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`IdTipoConsulta`) REFERENCES `tipoconsulta` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `categorias` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Categoria` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nombre_Categoria` (`Nombre_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `productos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Categoria` int NOT NULL,
  `Nombre_Producto` varchar(150) NOT NULL,
  `Descripcion` varchar(300) DEFAULT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Stock` int NOT NULL DEFAULT '0',
  `Estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`Id`),
  KEY `idx_productos_categoria` (`Id_Categoria`,`Estado`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ventas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Fecha_Venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Metodo_Pago` enum('efectivo','tarjeta','transferencia') NOT NULL,
  `Monto_Recibido` decimal(10,2) DEFAULT NULL,
  `Cambio` decimal(10,2) DEFAULT NULL,
  `Estado` enum('activa','confirmada','anulada') NOT NULL DEFAULT 'activa',
  `Anulado_Por` int DEFAULT NULL,
  `Fecha_Anulacion` datetime DEFAULT NULL,
  `requiere_factura` tinyint(1) DEFAULT '0',
  `correo_factura` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ventas_ibfk_1` (`Id_Propietario`),
  KEY `fk_ventas_anulado_por` (`Anulado_Por`),
  CONSTRAINT `fk_ventas_anulado_por` FOREIGN KEY (`Anulado_Por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalleventa` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Producto` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `detalleventa_ibfk_2` (`Id_Producto`),
  KEY `idx_detalle_venta` (`Id_Venta`,`Id_Producto`),
  CONSTRAINT `detalleventa_ibfk_1` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `detalleventa_ibfk_2` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_modulo` (`modulo`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `auditoria_acciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `veterinario_id` (`veterinario_id`),
  KEY `idx_mascota` (`mascota_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `historial_clinico_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `historial_clinico_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `veterinario_id` (`veterinario_id`),
  KEY `idx_historial` (`historial_id`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `consultas_medicas_ibfk_1` FOREIGN KEY (`historial_id`) REFERENCES `historial_clinico` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consultas_medicas_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `veterinario_id` (`veterinario_id`),
  KEY `idx_mascota` (`mascota_id`),
  KEY `idx_proxima_dosis` (`proxima_dosis`),
  CONSTRAINT `vacunas_aplicadas_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `vacunas_aplicadas_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notificaciones_vacunas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vacuna_id` int NOT NULL,
  `propietario_id` int NOT NULL,
  `notificado` tinyint(1) DEFAULT '0',
  `fecha_notificacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `propietario_id` (`propietario_id`),
  KEY `idx_vacuna` (`vacuna_id`),
  KEY `idx_notificado` (`notificado`),
  CONSTRAINT `notificaciones_vacunas_ibfk_1` FOREIGN KEY (`vacuna_id`) REFERENCES `vacunas_aplicadas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_vacunas_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietarios` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `Id_Producto` (`Id_Producto`),
  KEY `Id_Venta` (`Id_Venta`),
  KEY `Id_Usuario` (`Id_Usuario`),
  CONSTRAINT `movimientosstock_ibfk_1` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `movimientosstock_ibfk_2` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `movimientosstock_ibfk_3` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `facturaelectronica` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Cliente` int NOT NULL,
  `Id_TipoDocumento` int NOT NULL,
  `EstadoEnvio` enum('pendiente','enviado','fallido','no_enviar') NOT NULL DEFAULT 'pendiente',
  `CorreoDestino` varchar(150) DEFAULT NULL,
  `MensajeError` text,
  `FechaEnvio` datetime DEFAULT NULL,
  `IntentosEnvio` int DEFAULT '0',
  `NumeroControl` varchar(50) DEFAULT NULL,
  `CodigoGeneracion` varchar(100) DEFAULT NULL,
  `SelloRecepcion` varchar(200) DEFAULT NULL,
  `RutaComprobante` varchar(500) DEFAULT NULL,
  `IdentificadorComprobante` varchar(100) DEFAULT NULL,
  `FechaEmision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `facturaelectronica_ibfk_3` (`Id_TipoDocumento`),
  KEY `idx_identificador` (`IdentificadorComprobante`),
  KEY `idx_factura_estado_envio` (`EstadoEnvio`,`FechaEnvio`),
  KEY `idx_factura_venta` (`Id_Venta`),
  KEY `facturaelectronica_ibfk_2` (`Id_Cliente`),
  CONSTRAINT `facturaelectronica_ibfk_1` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `facturaelectronica_ibfk_2` FOREIGN KEY (`Id_Cliente`) REFERENCES `propietarios` (`Id`),
  CONSTRAINT `facturaelectronica_ibfk_3` FOREIGN KEY (`Id_TipoDocumento`) REFERENCES `tiposdocumento` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tiposdocumento` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Documento` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Tipo_Documento` (`Tipo_Documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_fecha_generacion` (`fecha_generacion`),
  KEY `idx_tipo_reporte` (`tipo_reporte`),
  CONSTRAINT `reportes_generados_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `RolId` int NOT NULL,
  `Modulo` varchar(100) NOT NULL,
  `Puede_Crear` tinyint(1) DEFAULT '0',
  `Puede_Leer` tinyint(1) DEFAULT '0',
  `Puede_Editar` tinyint(1) DEFAULT '0',
  `Puede_Eliminar` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `RolId` (`RolId`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO `roles` (`id`, `Nombre_Rol`) VALUES 
(1, 'Administrador'),
(2, 'Veterinario'),
(3, 'Recepcionista');

INSERT INTO `estadocita` (`Id`, `Estado`) VALUES 
(1, 'Pendiente'),
(2, 'En Curso'),
(3, 'Cancelada'),
(4, 'Completada');

INSERT INTO `tipoconsulta` (`Id`, `Tipo_Consulta`) VALUES 
(1, 'Consulta General'),
(2, 'Vacunación'),
(3, 'Control'),
(4, 'cirujia');

INSERT INTO `especies` (`Id`, `Nombre_Especie`) VALUES (1, 'Felino');

INSERT INTO `razas` (`Id`, `Id_Especie`, `Nombre_Raza`) VALUES (1, 1, 'Cane corso');

INSERT INTO `categorias` (`Id`, `Nombre_Categoria`) VALUES 
(1, 'Medicamentos'),
(2, 'Vacunas'),
(3, 'Alimentos'),
(4, 'Accesorios'),
(5, 'Higiene y Cuidado');

INSERT INTO `tiposdocumento` (`Id`, `Tipo_Documento`) VALUES (1, 'Factura Electronica');
-- Insertar usuario con contraseña en texto plano (temporal)
INSERT INTO `usuarios` (`Nombre_Usuario`, `Correo`, `Contrasena`, `RolId`, `activo`) 
VALUES ('Administrador', 'admin@vetcare.com', 'admin123', 1, 1);

-- ============================================
-- VERIFICAR ÍNDICE ÚNICO
-- ============================================
SHOW INDEX FROM citas WHERE Key_name = 'idx_unique_vet_hora';