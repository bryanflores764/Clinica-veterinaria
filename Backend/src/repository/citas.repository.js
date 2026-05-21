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

  // ── CREAR CITA ─────────────────────────────────────────────
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

  // ── OBTENER TODAS LAS CITAS ────────────────────────────────
  async findAll() {
    const [rows] = await connection.query(CitasQueries.FIND_ALL);
    return rows;
  },

  // ── OBTENER CITA POR ID ────────────────────────────────────
  async findById(id) {
    if (!id || isNaN(id))
      throw { status: 400, errores: ['El IdCita debe ser un número válido.'] };

    const [rows] = await connection.query(CitasQueries.FIND_BY_ID, [Number(id)]);
    if (rows.length === 0)
      throw { status: 404, errores: [`No se encontró una cita con IdCita ${id}.`] };

    return rows[0];
  },

  // ── OBTENER CITAS POR MASCOTA ──────────────────────────────
  async findByMascota(idMascota) {
    if (!idMascota || isNaN(idMascota))
      throw { status: 400, errores: ['El Id_Mascota debe ser un número válido.'] };

    const [rows] = await connection.query(CitasQueries.FIND_BY_MASCOTA, [Number(idMascota)]);
    return rows;
  },

  // ── ACTUALIZAR CITA ────────────────────────────────────────
  async update(id, { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
    await this.findById(id);

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

  // ── ACTUALIZAR ESTADO DE CITA ──────────────────────────────
  async updateEstado(id, { IdEstadoCita }) {
    await this.findById(id);

    if (!IdEstadoCita || isNaN(IdEstadoCita))
      throw { status: 400, errores: ['IdEstadoCita es obligatorio y debe ser un número.'] };

    await connection.query(CitasQueries.UPDATE_ESTADO, [Number(IdEstadoCita), Number(id)]);
    return { message: 'Estado de cita actualizado exitosamente.' };
  },

  // ── ELIMINAR CITA ──────────────────────────────────────────
  async delete(id) {
    await this.findById(id);
    await connection.query(CitasQueries.DELETE, [Number(id)]);
    return { message: 'Cita eliminada exitosamente.' };
  },

  // ============================================================
  //  VALIDACIONES DE CONFLICTOS (TODAS)
  // ============================================================

  // 1. Buscar cita por mascota y fecha (mismo día)
  async findByMascotaAndFecha(Id_Mascota, FechaHora, excludeId = null) {
    let query = CitasQueries.FIND_BY_MASCOTA_AND_FECHA;
    let params = [Number(Id_Mascota), FechaHora];
    
    if (excludeId) {
      query = CitasQueries.FIND_BY_MASCOTA_AND_FECHA_EXCLUDE;
      params = [Number(Id_Mascota), FechaHora, Number(excludeId)];
    }
    
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 2. Buscar cita por mascota, fecha y hora exacta
  async findByMascotaAndFechaHora(Id_Mascota, FechaHora, excludeId = null) {
    let query = `
      SELECT IdCita, Id_Mascota, FechaHora, IdTipoConsulta
      FROM citas
      WHERE Id_Mascota = ? 
        AND FechaHora = ?
        AND IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Mascota), FechaHora];
    
    if (excludeId) {
      query += ` AND IdCita != ?`;
      params.push(Number(excludeId));
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 3. Buscar cita por mascota, fecha y tipo de consulta
  async findByMascotaFechaAndTipo(Id_Mascota, FechaHora, IdTipoConsulta, excludeId = null) {
    let query = `
      SELECT c.IdCita, c.Id_Mascota, c.FechaHora, c.IdTipoConsulta, tc.Tipo_Consulta
      FROM citas c
      INNER JOIN tipoconsulta tc ON tc.Id = c.IdTipoConsulta
      WHERE c.Id_Mascota = ? 
        AND DATE(c.FechaHora) = DATE(?)
        AND c.IdTipoConsulta = ?
        AND c.IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Mascota), FechaHora, Number(IdTipoConsulta)];
    
    if (excludeId) {
      query += ` AND c.IdCita != ?`;
      params.push(Number(excludeId));
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 4. Buscar cita por veterinario y fecha/hora exacta
  async findByVeterinarioAndFecha(Id_Veterinario, FechaHora, excludeId = null) {
    let query = CitasQueries.FIND_BY_VETERINARIO_AND_FECHA;
    let params = [Number(Id_Veterinario), FechaHora];
    
    if (excludeId) {
      query = CitasQueries.FIND_BY_VETERINARIO_AND_FECHA_EXCLUDE;
      params = [Number(Id_Veterinario), FechaHora, Number(excludeId)];
    }
    
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 5. Buscar citas del veterinario en rango de tiempo
  async findByVeterinarioAndFechaRango(Id_Veterinario, FechaHora, excludeId = null) {
    const fecha = new Date(FechaHora);
    const fechaInicio = new Date(fecha.getTime() - 15 * 60000);
    const fechaFin = new Date(fecha.getTime() + 15 * 60000);
    
    const fechaInicioStr = fechaInicio.toISOString().slice(0, 19).replace('T', ' ');
    const fechaFinStr = fechaFin.toISOString().slice(0, 19).replace('T', ' ');
    
    let query = `
      SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
      FROM citas
      WHERE Id_Veterinario = ? 
        AND FechaHora BETWEEN ? AND ?
        AND IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Veterinario), fechaInicioStr, fechaFinStr];
    
    if (excludeId) {
      query += ` AND IdCita != ?`;
      params.push(Number(excludeId));
    }
    
    const [rows] = await connection.query(query, params);
    return rows;
  },

  // 6. Buscar cita duplicada exacta
  async findDuplicada(Id_Mascota, Id_Veterinario, FechaHora, excludeId = null) {
    let query = CitasQueries.FIND_DUPLICADA;
    let params = [Number(Id_Mascota), Number(Id_Veterinario), FechaHora];
    
    if (excludeId) {
      query = CitasQueries.FIND_DUPLICADA_EXCLUDE;
      params = [Number(Id_Mascota), Number(Id_Veterinario), FechaHora, Number(excludeId)];
    }
    
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 7. Verificar disponibilidad del veterinario (horario laboral)
  async verificarHorarioLaboral(Id_Veterinario, FechaHora) {
    const fecha = new Date(FechaHora);
    const hora = fecha.getHours();
    const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ...
    
    // Verificar si es fin de semana (sábado=6, domingo=0)
    if (diaSemana === 0 || diaSemana === 6) {
      return { disponible: false, mensaje: 'Los veterinarios no atienden los fines de semana.' };
    }
    
    // Verificar horario laboral (ej: 8am - 6pm)
    if (hora < 8 || hora >= 18) {
      return { disponible: false, mensaje: 'El horario de atención es de 8:00 a 18:00 horas.' };
    }
    
    return { disponible: true };
  },


  // ============================================================
//  NUEVAS FUNCIONES (AGREGAR)
// ============================================================

// Obtener citas por veterinario
async findByVeterinario(idVeterinario) {
  const [rows] = await connection.query(CitasQueries.FIND_BY_VETERINARIO, [idVeterinario]);
  return rows;
},

// Obtener citas por mascota
async findByMascotaId(idMascota) {
  const [rows] = await connection.query(CitasQueries.FIND_BY_MASCOTA_ID, [idMascota]);
  return rows;
},

};

module.exports = CitasRepository;