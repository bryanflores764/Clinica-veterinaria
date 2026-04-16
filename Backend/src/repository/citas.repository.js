// ============================================================
//  CAPA: Repository
//  Archivo: citas.repository.js
// ============================================================

const connection  = require('../database/connection');
const CitasQueries = require('../models/citas.model');

// ── Validaciones ─────────────────────────────────────────────
function validarCita({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
  const errores = [];

  if (!Id_Mascota || isNaN(Id_Mascota))
    errores.push('Id_Mascota es obligatorio y debe ser un número.');

  if (!Id_Veterinario || isNaN(Id_Veterinario))
    errores.push('Id_Veterinario es obligatorio y debe ser un número.');

  if (!IdTipoConsulta || isNaN(IdTipoConsulta))
    errores.push('IdTipoConsulta es obligatorio y debe ser un número.');

  if (!IdEstadoCita || isNaN(IdEstadoCita))
    errores.push('IdEstadoCita es obligatorio y debe ser un número.');

  if (!FechaHora || FechaHora.trim() === '')
    errores.push('FechaHora es obligatoria.');
  else if (isNaN(Date.parse(FechaHora)))
    errores.push('FechaHora no tiene un formato válido (ej: 2026-04-15T10:00:00).');

  return errores;
}

// ── CRUD ─────────────────────────────────────────────────────
const CitasRepository = {

  async create({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
    const errores = validarCita({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
    if (errores.length > 0) throw { status: 400, errores };

    const [result] = await connection.query(CitasQueries.CREATE, [
      Number(Id_Mascota),
      Number(Id_Veterinario),
      Number(IdTipoConsulta),
      Number(IdEstadoCita),
      FechaHora,
    ]);

    return { id: result.insertId, message: 'Cita creada exitosamente.' };
  },

  async findAll() {
    const [rows] = await connection.query(CitasQueries.FIND_ALL);
    return rows;
  },

  async findById(id) {
    if (!id || isNaN(id))
      throw { status: 400, errores: ['El IdCita debe ser un número válido.'] };

    const [rows] = await connection.query(CitasQueries.FIND_BY_ID, [Number(id)]);
    if (rows.length === 0)
      throw { status: 404, errores: [`No se encontró una cita con IdCita ${id}.`] };

    return rows[0];
  },

  async findByMascota(idMascota) {
    if (!idMascota || isNaN(idMascota))
      throw { status: 400, errores: ['El Id_Mascota debe ser un número válido.'] };

    const [rows] = await connection.query(CitasQueries.FIND_BY_MASCOTA, [Number(idMascota)]);
    return rows;
  },

  async update(id, { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
    await this.findById(id);

    const errores = validarCita({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
    if (errores.length > 0) throw { status: 400, errores };

    await connection.query(CitasQueries.UPDATE, [
      Number(Id_Mascota),
      Number(Id_Veterinario),
      Number(IdTipoConsulta),
      Number(IdEstadoCita),
      FechaHora,
      Number(id),
    ]);

    return { message: 'Cita actualizada exitosamente.' };
  },

  async updateEstado(id, { IdEstadoCita }) {
    await this.findById(id);

    if (!IdEstadoCita || isNaN(IdEstadoCita))
      throw { status: 400, errores: ['IdEstadoCita es obligatorio y debe ser un número.'] };

    await connection.query(CitasQueries.UPDATE_ESTADO, [Number(IdEstadoCita), Number(id)]);
    return { message: 'Estado de cita actualizado exitosamente.' };
  },

  async delete(id) {
    await this.findById(id);
    await connection.query(CitasQueries.DELETE, [Number(id)]);
    return { message: 'Cita eliminada exitosamente.' };
  },

};

module.exports = CitasRepository;