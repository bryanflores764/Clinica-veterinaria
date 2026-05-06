// ============================================================
//  CAPA: Model
//  Archivo: productos.model.js
// ============================================================

const ProductosQueries = {

  // --- CREAR ---
  CREATE: `
    INSERT INTO productos (Id_Categoria, Nombre_Producto, Descripcion, Precio, Stock, Estado)
    VALUES (?, ?, ?, ?, ?, 'activo')
  `,

  // --- LEER ---
  FIND_ALL_ACTIVOS: `
    SELECT
      p.Id,
      p.Nombre_Producto,
      p.Descripcion,
      p.Precio,
      p.Stock,
      p.Estado,
      c.Nombre_Categoria AS Categoria
    FROM productos p
    INNER JOIN categorias c ON c.Id = p.Id_Categoria
    WHERE p.Estado = 'activo'
    ORDER BY p.Nombre_Producto ASC
  `,

  FIND_ALL: `
    SELECT
      p.Id,
      p.Nombre_Producto,
      p.Descripcion,
      p.Precio,
      p.Stock,
      p.Estado,
      c.Nombre_Categoria AS Categoria
    FROM productos p
    INNER JOIN categorias c ON c.Id = p.Id_Categoria
    ORDER BY p.Nombre_Producto ASC
  `,

  FIND_BY_ID: `
    SELECT
      p.Id,
      p.Id_Categoria,
      p.Nombre_Producto,
      p.Descripcion,
      p.Precio,
      p.Stock,
      p.Estado,
      c.Nombre_Categoria AS Categoria
    FROM productos p
    INNER JOIN categorias c ON c.Id = p.Id_Categoria
    WHERE p.Id = ?
  `,

  // --- ACTUALIZAR ---
  UPDATE: `
    UPDATE productos
    SET Id_Categoria = ?, Nombre_Producto = ?, Descripcion = ?, Precio = ?
    WHERE Id = ?
  `,

  // --- STOCK ---
  UPDATE_STOCK: `
    UPDATE productos
    SET Stock = Stock + ?
    WHERE Id = ?
  `,

  // --- DESACTIVAR (soft delete) ---
  DESACTIVAR: `
    UPDATE productos
    SET Estado = 'inactivo'
    WHERE Id = ?
  `,

  // --- ACTIVAR ---
  ACTIVAR: `
    UPDATE productos
    SET Estado = 'activo'
    WHERE Id = ?
  `,

  // --- MOVIMIENTOS STOCK ---
  CREATE_MOVIMIENTO: `
    INSERT INTO movimientosstock (Id_Producto, Id_Venta, Id_Usuario, Tipo, Cantidad, Stock_Antes, Stock_Despues)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  FIND_MOVIMIENTOS_BY_PRODUCTO: `
    SELECT
      m.Id,
      m.Tipo,
      m.Cantidad,
      m.Stock_Antes,
      m.Stock_Despues,
      m.Fecha,
      m.Id_Venta,
      u.Nombre_Usuario AS Usuario
    FROM movimientosstock m
    INNER JOIN usuarios u ON u.id = m.Id_Usuario
    WHERE m.Id_Producto = ?
    ORDER BY m.Fecha DESC
  `,
};

module.exports = ProductosQueries;