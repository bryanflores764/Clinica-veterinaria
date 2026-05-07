// ============================================================
//  CAPA: Repository
//  Archivo: ventas.repository.js
// ============================================================

const connection = require('../database/connection');

// ── VENTAS ───────────────────────────────────────────────────

const createVenta = async (idPropietario) => {
  const [result] = await connection.execute(
    "INSERT INTO ventas (Id_Propietario, Fecha_Venta, Estado, Total) VALUES (?, NOW(), 'activa', 0.00)",
    [idPropietario]
  );
  return { id: result.insertId, Id_Propietario: idPropietario };
};

const findAllVentas = async () => {
  const [rows] = await connection.execute(`
    SELECT v.*, p.Nombre as Nombre_Propietario 
    FROM ventas v
    LEFT JOIN propietarios p ON v.Id_Propietario = p.Id
    ORDER BY v.Fecha_Venta DESC
  `);
  return rows;
};

const findVentaById = async (id) => {
  const [rows] = await connection.execute(`
    SELECT v.*, p.Nombre as Nombre_Propietario 
    FROM ventas v
    LEFT JOIN propietarios p ON v.Id_Propietario = p.Id
    WHERE v.Id = ?
  `, [id]);
  return rows[0] || null;
};

const findDetalleByVenta = async (idVenta) => {
  const [rows] = await connection.execute(`
    SELECT d.*, p.Nombre_Producto, p.Precio 
    FROM detalleventa d
    INNER JOIN productos p ON d.Id_Producto = p.Id
    WHERE d.Id_Venta = ?
  `, [idVenta]);
  return rows;
};

// ── DETALLE ───────────────────────────────────────────────────

const createDetalle = async (idVenta, idProducto, cantidad, precioUnitario) => {
  const [result] = await connection.execute(
    "INSERT INTO detalleventa (Id_Venta, Id_Producto, Cantidad, Precio_Unitario) VALUES (?, ?, ?, ?)",
    [idVenta, idProducto, cantidad, precioUnitario]
  );
  return { 
    id: result.insertId, 
    Id_Venta: idVenta, 
    Id_Producto: idProducto, 
    Cantidad: cantidad, 
    Precio_Unitario: precioUnitario 
  };
};

// ── STOCK ─────────────────────────────────────────────────────

const getStockProducto = async (idProducto) => {
  const [rows] = await connection.execute(
    "SELECT Id, Nombre_Producto, Stock, Precio, Estado FROM productos WHERE Id = ?",
    [idProducto]
  );
  return rows[0] || null;
};

const descontarStock = async (idProducto, cantidad) => {
  const [result] = await connection.execute(
    "UPDATE productos SET Stock = Stock - ? WHERE Id = ? AND Stock >= ?",
    [cantidad, idProducto, cantidad]
  );
  return result.affectedRows;
};

const actualizarStock = async (idProducto, nuevoStock) => {
  const [result] = await connection.execute(
    "UPDATE productos SET Stock = ? WHERE Id = ?",
    [nuevoStock, idProducto]
  );
  return result.affectedRows;
};

// ── MOVIMIENTOS STOCK ─────────────────────────────────────────

const registrarMovimientoStock = async (idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues) => {
  const [result] = await connection.execute(
    `INSERT INTO movimientosstock 
     (Id_Producto, Id_Venta, Id_Usuario, Tipo, Cantidad, Stock_Antes, Stock_Despues, Fecha) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues]
  );
  return result.insertId;
};

// ── TOTAL ─────────────────────────────────────────────────────

const calcularTotal = async (idVenta) => {
  const [rows] = await connection.execute(
    "SELECT SUM(Cantidad * Precio_Unitario) as Total FROM detalleventa WHERE Id_Venta = ?",
    [idVenta]
  );
  return rows[0]?.Total ?? 0;
};

// ── ESTADO VENTAS ─────────────────────────────────────────────

const confirmarVenta = async (idVenta) => {
  const [result] = await connection.execute(
    "UPDATE ventas SET Estado = 'confirmada' WHERE Id = ?",
    [idVenta]
  );
  return result.affectedRows;
};

const confirmarVentaConTotal = async (idVenta, total) => {
  const [result] = await connection.execute(
    "UPDATE ventas SET Estado = 'confirmada', Total = ? WHERE Id = ?",
    [total, idVenta]
  );
  return result.affectedRows;
};

const anularVentaConDatos = async (idVenta, idUsuario) => {
  const [result] = await connection.execute(
    "UPDATE ventas SET Estado = 'anulada', Anulado_Por = ?, Fecha_Anulacion = NOW() WHERE Id = ?",
    [idUsuario, idVenta]
  );
  return result.affectedRows;
};

// ── EXPORTAR TODAS LAS FUNCIONES ──────────────────────────────

module.exports = {
  createVenta,
  findAllVentas,
  findVentaById,
  findDetalleByVenta,
  createDetalle,
  getStockProducto,
  descontarStock,
  actualizarStock,
  registrarMovimientoStock,
  calcularTotal,
  confirmarVenta,
  confirmarVentaConTotal,
  anularVentaConDatos,
};