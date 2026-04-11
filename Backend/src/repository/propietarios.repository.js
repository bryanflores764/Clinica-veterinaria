//============================================================
//  CAPA: Repository
//  Archivo: propietarios.repository.js
// ============================================================

const connection       = require('../database/connection');
const PropietariosQueries = require('../models/propietarios.model');

// ── Validaciones ────────────────────────────────────────────
function validarPropietario({ Nombre, Telefono, Correo, Direccion }) {
  const errores = [];

  // Nombre
  if (!Nombre || Nombre.trim() === '')
    errores.push('El Nombre es obligatorio.');
  else if (Nombre.trim().length < 2 || Nombre.trim().length > 150)
    errores.push('El Nombre debe tener entre 2 y 150 caracteres.');

  // Teléfono (opcional)
  if (Telefono && !/^[+\d\s\-(). ]{7,20}$/.test(Telefono))
    errores.push('El Teléfono no tiene un formato válido (ej: +502 5555-1234).');

  // Correo (opcional)
  if (Correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Correo))
    errores.push('El Correo no tiene un formato válido.');

  // Dirección (opcional)
  if (Direccion && Direccion.trim().length > 250)
    errores.push('La Dirección no puede superar los 250 caracteres.');

  return errores;
}

// ── CRUD ────────────────────────────────────────────────────
const PropietariosRepository = {

  async create({ Nombre, Telefono, Correo, Direccion }) {
    const errores = validarPropietario({ Nombre, Telefono, Correo, Direccion });
    if (errores.length > 0) throw { status: 400, errores };

    // Verificar correo duplicado
    if (Correo) {
      const [existe] = await connection.query(
        PropietariosQueries.FIND_BY_CORREO,
        [Correo.trim().toLowerCase()]
      );
      if (existe.length > 0)
        throw { status: 409, errores: ['El Correo ya está registrado.'] };
    }

    const [result] = await connection.query(PropietariosQueries.CREATE, [
      Nombre.trim(),
      Telefono?.trim() || null,
      Correo?.trim().toLowerCase() || null,
      Direccion?.trim() || null,
    ]);

    return { id: result.insertId, message: 'Propietario creado exitosamente.' };
  },

  async findAll() {
    const [rows] = await connection.query(PropietariosQueries.FIND_ALL);
    return rows;
  },

  async findById(id) {
    if (!id || isNaN(id))
      throw { status: 400, errores: ['El Id debe ser un número válido.'] };

    const [rows] = await connection.query(PropietariosQueries.FIND_BY_ID, [id]);
    if (rows.length === 0)
      throw { status: 404, errores: [`No se encontró un propietario con Id ${id}.`] };

    return rows[0];
  },

  async findByNombre(nombre) {
    if (!nombre || nombre.trim() === '')
      throw { status: 400, errores: ['Debe proporcionar un nombre para buscar.'] };

    const [rows] = await connection.query(
      PropietariosQueries.FIND_BY_NOMBRE,
      [`%${nombre.trim()}%`]
    );
    return rows;
  },

  async update(id, { Nombre, Telefono, Correo, Direccion }) {
    await this.findById(id); // lanza 404 si no existe

    const errores = validarPropietario({ Nombre, Telefono, Correo, Direccion });
    if (errores.length > 0) throw { status: 400, errores };

    // Verificar correo duplicado en otro registro
    if (Correo) {
      const [existe] = await connection.query(
        PropietariosQueries.FIND_BY_CORREO,
        [Correo.trim().toLowerCase()]
      );
      if (existe.length > 0 && existe[0].Id !== Number(id))
        throw { status: 409, errores: ['El Correo ya está registrado por otro propietario.'] };
    }

    await connection.query(PropietariosQueries.UPDATE, [
      Nombre.trim(),
      Telefono?.trim() || null,
      Correo?.trim().toLowerCase() || null,
      Direccion?.trim() || null,
      id,
    ]);

    return { message: 'Propietario actualizado exitosamente.' };
  },

  async delete(id) {
    await this.findById(id); // lanza 404 si no existe
    await connection.query(PropietariosQueries.DELETE, [id]);
    return { message: 'Propietario eliminado exitosamente.' };
  },

};

module.exports = PropietariosRepository;
