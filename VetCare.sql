-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vetcare
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Categoria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nombre_Categoria` (`Nombre_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `IdCita` int NOT NULL AUTO_INCREMENT,
  `Id_Mascota` int NOT NULL,
  `Id_Veterinario` int NOT NULL,
  `IdTipoConsulta` int NOT NULL,
  `IdEstadoCita` int NOT NULL,
  `FechaHora` datetime NOT NULL,
  PRIMARY KEY (`IdCita`),
  KEY `Id_Mascota` (`Id_Mascota`),
  KEY `Id_Veterinario` (`Id_Veterinario`),
  KEY `IdEstadoCita` (`IdEstadoCita`),
  KEY `IdTipoConsulta` (`IdTipoConsulta`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`Id_Mascota`) REFERENCES `mascotas` (`Id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`Id_Veterinario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`IdEstadoCita`) REFERENCES `estadocita` (`Id`),
  CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`IdTipoConsulta`) REFERENCES `tipoconsulta` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientesfacturacion`
--

DROP TABLE IF EXISTS `clientesfacturacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientesfacturacion` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `NombreFiscal` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NIT` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NRC` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DUI` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DireccionFiscal` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Correo` (`Correo`),
  UNIQUE KEY `DUI` (`DUI`),
  UNIQUE KEY `NIT` (`NIT`),
  UNIQUE KEY `NRC` (`NRC`),
  KEY `Id_Propietario` (`Id_Propietario`),
  CONSTRAINT `clientesfacturacion_ibfk_1` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientesfacturacion`
--

LOCK TABLES `clientesfacturacion` WRITE;
/*!40000 ALTER TABLE `clientesfacturacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientesfacturacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalleventa`
--

DROP TABLE IF EXISTS `detalleventa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalleventa` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Producto` int NOT NULL,
  `Cantidad` int NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Producto` (`Id_Producto`),
  KEY `Id_Venta` (`Id_Venta`),
  CONSTRAINT `detalleventa_ibfk_1` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id`),
  CONSTRAINT `detalleventa_ibfk_2` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalleventa`
--

LOCK TABLES `detalleventa` WRITE;
/*!40000 ALTER TABLE `detalleventa` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalleventa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especies`
--

DROP TABLE IF EXISTS `especies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especies` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Especie` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nombre_Especie` (`Nombre_Especie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especies`
--

LOCK TABLES `especies` WRITE;
/*!40000 ALTER TABLE `especies` DISABLE KEYS */;
/*!40000 ALTER TABLE `especies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadocita`
--

DROP TABLE IF EXISTS `estadocita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadocita` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Estado` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Estado` (`Estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadocita`
--

LOCK TABLES `estadocita` WRITE;
/*!40000 ALTER TABLE `estadocita` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadocita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadosfactura`
--

DROP TABLE IF EXISTS `estadosfactura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadosfactura` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Estado` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Estado` (`Estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadosfactura`
--

LOCK TABLES `estadosfactura` WRITE;
/*!40000 ALTER TABLE `estadosfactura` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadosfactura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturaelectronica`
--

DROP TABLE IF EXISTS `facturaelectronica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturaelectronica` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Venta` int NOT NULL,
  `Id_Cliente` int NOT NULL,
  `Id_TipoDocumento` int NOT NULL,
  `Id_EstadoFactura` int NOT NULL,
  `NumeroControl` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CodigoGeneracion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SelloRecepcion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FechaEmision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `Id_Cliente` (`Id_Cliente`),
  KEY `Id_EstadoFactura` (`Id_EstadoFactura`),
  KEY `Id_TipoDocumento` (`Id_TipoDocumento`),
  KEY `Id_Venta` (`Id_Venta`),
  CONSTRAINT `facturaelectronica_ibfk_1` FOREIGN KEY (`Id_Cliente`) REFERENCES `clientesfacturacion` (`Id`),
  CONSTRAINT `facturaelectronica_ibfk_2` FOREIGN KEY (`Id_EstadoFactura`) REFERENCES `estadosfactura` (`Id`),
  CONSTRAINT `facturaelectronica_ibfk_3` FOREIGN KEY (`Id_TipoDocumento`) REFERENCES `tiposdocumento` (`Id`),
  CONSTRAINT `facturaelectronica_ibfk_4` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturaelectronica`
--

LOCK TABLES `facturaelectronica` WRITE;
/*!40000 ALTER TABLE `facturaelectronica` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturaelectronica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_medicamentos`
--

DROP TABLE IF EXISTS `historial_medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_medicamentos` (
  `Id_Historial` int NOT NULL,
  `Id_Medicamento` int NOT NULL,
  `Dosis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Historial`,`Id_Medicamento`),
  KEY `Id_Medicamento` (`Id_Medicamento`),
  CONSTRAINT `historial_medicamentos_ibfk_1` FOREIGN KEY (`Id_Historial`) REFERENCES `historialclinico` (`Id`),
  CONSTRAINT `historial_medicamentos_ibfk_2` FOREIGN KEY (`Id_Medicamento`) REFERENCES `medicamentos` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medicamentos`
--

LOCK TABLES `historial_medicamentos` WRITE;
/*!40000 ALTER TABLE `historial_medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historialclinico`
--

DROP TABLE IF EXISTS `historialclinico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialclinico` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Mascota` int NOT NULL,
  `Fecha_Consulta` datetime NOT NULL,
  `Motivo_Consulta` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Diagnostico` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Peso_Actual` decimal(5,2) DEFAULT NULL,
  `Proxima_Cita` date DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Mascota` (`Id_Mascota`),
  CONSTRAINT `historialclinico_ibfk_1` FOREIGN KEY (`Id_Mascota`) REFERENCES `mascotas` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historialclinico`
--

LOCK TABLES `historialclinico` WRITE;
/*!40000 ALTER TABLE `historialclinico` DISABLE KEYS */;
/*!40000 ALTER TABLE `historialclinico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascotas`
--

DROP TABLE IF EXISTS `mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mascotas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Id_Raza` int NOT NULL,
  `Nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Fecha_Nacimiento` date DEFAULT NULL,
  `Peso` decimal(5,2) DEFAULT NULL,
  `Color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Propietario` (`Id_Propietario`),
  KEY `Id_Raza` (`Id_Raza`),
  CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`),
  CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`Id_Raza`) REFERENCES `razas` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascotas`
--

LOCK TABLES `mascotas` WRITE;
/*!40000 ALTER TABLE `mascotas` DISABLE KEYS */;
/*!40000 ALTER TABLE `mascotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamentos`
--

DROP TABLE IF EXISTS `medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamentos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Medicamento` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamentos`
--

LOCK TABLES `medicamentos` WRITE;
/*!40000 ALTER TABLE `medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `RolId` int NOT NULL,
  `Modulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Puede_Crear` tinyint(1) NOT NULL DEFAULT '0',
  `Puede_Leer` tinyint(1) NOT NULL DEFAULT '0',
  `Puede_Editar` tinyint(1) NOT NULL DEFAULT '0',
  `Puede_Eliminar` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `RolId` (`RolId`,`Modulo`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Categoria` int NOT NULL,
  `Nombre_Producto` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`),
  KEY `Id_Categoria` (`Id_Categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propietarios`
--

DROP TABLE IF EXISTS `propietarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `propietarios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Direccion` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Correo` (`Correo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propietarios`
--

LOCK TABLES `propietarios` WRITE;
/*!40000 ALTER TABLE `propietarios` DISABLE KEYS */;
INSERT INTO `propietarios` VALUES (2,'Juan Pérez','7894-5612','juan@email.com','San Salvador','activo'),(3,'Juan Pérez','7894-5612','juanes@email.com','San Salvador','');
/*!40000 ALTER TABLE `propietarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `razas`
--

DROP TABLE IF EXISTS `razas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `razas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Especie` int NOT NULL,
  `Nombre_Raza` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Especie` (`Id_Especie`),
  CONSTRAINT `razas_ibfk_1` FOREIGN KEY (`Id_Especie`) REFERENCES `especies` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `razas`
--

LOCK TABLES `razas` WRITE;
/*!40000 ALTER TABLE `razas` DISABLE KEYS */;
/*!40000 ALTER TABLE `razas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Nombre_Rol` (`Nombre_Rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(3,'Recepcionista'),(2,'Veterinario');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipoconsulta`
--

DROP TABLE IF EXISTS `tipoconsulta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoconsulta` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Consulta` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Tipo_Consulta` (`Tipo_Consulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipoconsulta`
--

LOCK TABLES `tipoconsulta` WRITE;
/*!40000 ALTER TABLE `tipoconsulta` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipoconsulta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiposdocumento`
--

DROP TABLE IF EXISTS `tiposdocumento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposdocumento` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo_Documento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Tipo_Documento` (`Tipo_Documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiposdocumento`
--

LOCK TABLES `tiposdocumento` WRITE;
/*!40000 ALTER TABLE `tiposdocumento` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiposdocumento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre_Usuario` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RolId` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Correo` (`Correo`),
  KEY `RolId` (`RolId`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`RolId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@vetcare.com','$2b$10$O/984eV5DNDTRmgpQIHg3O79q2OzeEWdTwuysnTvkNfV.K7Gl9z7W',1,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Propietario` int NOT NULL,
  `Fecha_Venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `Id_Propietario` (`Id_Propietario`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`Id_Propietario`) REFERENCES `propietarios` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14 13:04:21
