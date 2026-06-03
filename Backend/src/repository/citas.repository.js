// ============================================================
//  CAPA: Repository
//  Archivo: citas.repository.js  (CORREGIDO)
// ============================================================

const connection   = require('../database/connection');
const CitasQueries = require('../models/citas.model');


// ── Utilidad: normalizar fecha para MySQL ─────────────────────
// MySQL espera 'YYYY-MM-DD HH:MM:SS', no 'YYYY-MM-DDTHH:MM:SS'
const toMySQL = (fechaHora) => {
  if (!fechaHora) return fechaHora;
  return String(fechaHora).replace('T', ' ').slice(0, 19);
};

// ── Validaciones ──────────────────────────────────────────────
function validarCita({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
  const errores = [];
  if (!Id_Mascota     || isNaN(Id_Mascota))     errores.push('Id_Mascota es obligatorio y debe ser un número.');
  if (!Id_Veterinario || isNaN(Id_Veterinario)) errores.push('Id_Veterinario es obligatorio y debe ser un número.');
  if (!IdTipoConsulta || isNaN(IdTipoConsulta)) errores.push('IdTipoConsulta es obligatorio y debe ser un número.');
  if (!IdEstadoCita   || isNaN(IdEstadoCita))   errores.push('IdEstadoCita es obligatorio y debe ser un número.');
  if (!FechaHora || String(FechaHora).trim() === '') errores.push('FechaHora es obligatoria.');
  else if (isNaN(Date.parse(FechaHora)))             errores.push('FechaHora no tiene un formato válido.');
  return errores;
}



const CitasRepository = {

  // 3b. Verificar si el veterinario ya tiene cita exactamente a esa hora (versión simple)
async verificarVeterinarioHoraExacta(Id_Veterinario, FechaHora, excludeId = null) {
  // Validar que el veterinario sea válido
  if (!Id_Veterinario || Id_Veterinario === 0) {
    return null;
  }

  // Formatear la fecha para comparación exacta
  let fechaSQL;
  if (FechaHora.includes('T')) {
    fechaSQL = FechaHora.replace('T', ' ').slice(0, 19);
  } else {
    fechaSQL = FechaHora.slice(0, 19);
  }

  // Comparación directa sin DATE_FORMAT
  let query = `
    SELECT IdCita, FechaHora
    FROM citas
    WHERE Id_Veterinario = ?
      AND FechaHora = ?
      AND IdEstadoCita NOT IN (3)
  `;
  
  let params = [Number(Id_Veterinario), fechaSQL];
  if (excludeId) {
    query += ` AND IdCita != ?`;
    params.push(Number(excludeId));
  }
  
  
  const [rows] = await connection.query(query, params);
  
  if (rows.length > 0) {
    console.log(`⚠️ [VetExacta] Encontrada cita ${rows[0].IdCita} a las ${rows[0].FechaHora}`);
    return rows[0];
  }
  
  return null;
},

  // ── CREAR ────────────────────────────────────────────────────
  async create({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
    const errores = validarCita({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
    if (errores.length > 0) throw { status: 400, errores };

    const [result] = await connection.query(CitasQueries.CREATE, [
      Number(Id_Mascota),
      Number(Id_Veterinario),
      Number(IdTipoConsulta),
      Number(IdEstadoCita),
      toMySQL(FechaHora),
    ]);
    return { id: result.insertId, message: 'Cita creada exitosamente.' };
  },

  // ── FIND ALL ─────────────────────────────────────────────────
  async findAll() {
    const [rows] = await connection.query(CitasQueries.FIND_ALL);
    return rows;
  },

  // ── FIND BY ID ───────────────────────────────────────────────
  async findById(id) {
    if (!id || isNaN(id)) throw { status: 400, errores: ['El IdCita debe ser un número válido.'] };
    const [rows] = await connection.query(CitasQueries.FIND_BY_ID, [Number(id)]);
    if (rows.length === 0) throw { status: 404, errores: [`No se encontró una cita con IdCita ${id}.`] };
    return rows[0];
  },

  // ── FIND BY MASCOTA ──────────────────────────────────────────
  async findByMascota(idMascota) {
    if (!idMascota || isNaN(idMascota)) throw { status: 400, errores: ['El Id_Mascota debe ser un número válido.'] };
    const [rows] = await connection.query(CitasQueries.FIND_BY_MASCOTA, [Number(idMascota)]);
    return rows;
  },

  // ── UPDATE ───────────────────────────────────────────────────
  async update(id, { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora }) {
    await this.findById(id);
    const params = [
      Number(Id_Mascota),
      Number(Id_Veterinario),
      Number(IdTipoConsulta),
      Number(IdEstadoCita),
      toMySQL(FechaHora),
      Number(id),
    ];
    const [result] = await connection.query(CitasQueries.UPDATE, params);
    if (result.affectedRows === 0) {
      throw { status: 500, message: `No se pudo actualizar la cita ${id}.` };
    }
    return { message: 'Cita actualizada exitosamente.' };
  },

  // ── UPDATE ESTADO ────────────────────────────────────────────
  async updateEstado(id, { IdEstadoCita }) {
    await this.findById(id);
    if (!IdEstadoCita || isNaN(IdEstadoCita)) throw { status: 400, errores: ['IdEstadoCita inválido.'] };
    await connection.query(CitasQueries.UPDATE_ESTADO, [Number(IdEstadoCita), Number(id)]);
    return { message: 'Estado actualizado exitosamente.' };
  },

  // ── DELETE ───────────────────────────────────────────────────
  async delete(id) {
    await this.findById(id);
    await connection.query(CitasQueries.DELETE, [Number(id)]);
    return { message: 'Cita eliminada exitosamente.' };
  },

  // ============================================================
  //  VALIDACIONES DE CONFLICTOS
  // ============================================================

  // 1. Mascota en la misma hora exacta
  async findByMascotaAndFechaHora(Id_Mascota, FechaHora, excludeId = null) {
    const fechaSQL = toMySQL(FechaHora); // ← FIX
    let query  = `
      SELECT IdCita, Id_Mascota, FechaHora, IdTipoConsulta
      FROM citas
      WHERE Id_Mascota = ? AND FechaHora = ? AND IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Mascota), fechaSQL];
    if (excludeId) { query += ` AND IdCita != ?`; params.push(Number(excludeId)); }
    query += ` LIMIT 1`;
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 2. Mascota, mismo tipo de consulta, mismo día
  async findByMascotaFechaAndTipo(Id_Mascota, FechaHora, IdTipoConsulta, excludeId = null) {
    const fechaSQL = toMySQL(FechaHora); // ← FIX
    let query  = `
      SELECT c.IdCita, c.Id_Mascota, c.FechaHora, c.IdTipoConsulta, tc.Tipo_Consulta
      FROM citas c
      INNER JOIN tipoconsulta tc ON tc.Id = c.IdTipoConsulta
      WHERE c.Id_Mascota = ?
        AND DATE(c.FechaHora) = DATE(?)
        AND c.IdTipoConsulta  = ?
        AND c.IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Mascota), fechaSQL, Number(IdTipoConsulta)];
    if (excludeId) { query += ` AND c.IdCita != ?`; params.push(Number(excludeId)); }
    query += ` LIMIT 1`;
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 3. Veterinario en rango ±15 min (VERSIÓN CORREGIDA)
async findByVeterinarioAndFechaRango(Id_Veterinario, FechaHora, excludeId = null) {
  // Validar que Id_Veterinario no sea null/undefined
  if (!Id_Veterinario || Id_Veterinario === 0) {
    return [];
  }

  // Crear fechas con precisión de segundos (sin milisegundos)
  const fechaOriginal = new Date(FechaHora);
  // Redondear a segundos (eliminar milisegundos)
  fechaOriginal.setMilliseconds(0);
  
  const fechaInicio = new Date(fechaOriginal.getTime() - 15 * 60000);
  const fechaFin = new Date(fechaOriginal.getTime() + 15 * 60000);
  
  // Convertir a string ISO sin milisegundos
  const inicioSQL = fechaInicio.toISOString().slice(0, 19).replace('T', ' ');
  const finSQL = fechaFin.toISOString().slice(0, 19).replace('T', ' ');
  const fechaSQL = fechaOriginal.toISOString().slice(0, 19).replace('T', ' ');
  
  let query = `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Veterinario = ?
      AND FechaHora BETWEEN ? AND ?
      AND IdEstadoCita NOT IN (3)
  `;
  let params = [Number(Id_Veterinario), inicioSQL, finSQL];
  if (excludeId) { 
    query += ` AND IdCita != ?`; 
    params.push(Number(excludeId)); 
  }
  
  
  const [rows] = await connection.query(query, params);
  
  return rows;
},

  // 4. Veterinario hora exacta
  async findByVeterinarioAndFecha(Id_Veterinario, FechaHora, excludeId = null) {
    const fechaSQL = toMySQL(FechaHora); // ← FIX
    let query  = `
      SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
      FROM citas
      WHERE Id_Veterinario = ? AND FechaHora = ? AND IdEstadoCita NOT IN (3)
    `;
    let params = [Number(Id_Veterinario), fechaSQL];
    if (excludeId) { query += ` AND IdCita != ?`; params.push(Number(excludeId)); }
    query += ` LIMIT 1`;
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 5. Cita duplicada exacta
  async findDuplicada(Id_Mascota, Id_Veterinario, FechaHora, excludeId = null) {
    const fechaSQL = toMySQL(FechaHora); // ← FIX
    let query  = CitasQueries.FIND_DUPLICADA;
    let params = [Number(Id_Mascota), Number(Id_Veterinario), fechaSQL];
    if (excludeId) {
      query  = CitasQueries.FIND_DUPLICADA_EXCLUDE;
      params = [Number(Id_Mascota), Number(Id_Veterinario), fechaSQL, Number(excludeId)];
    }
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 6. Mascota y fecha (mismo día)
  async findByMascotaAndFecha(Id_Mascota, FechaHora, excludeId = null) {
    const fechaSQL = toMySQL(FechaHora); // ← FIX
    let query  = CitasQueries.FIND_BY_MASCOTA_AND_FECHA;
    let params = [Number(Id_Mascota), fechaSQL];
    if (excludeId) {
      query  = CitasQueries.FIND_BY_MASCOTA_AND_FECHA_EXCLUDE;
      params = [Number(Id_Mascota), fechaSQL, Number(excludeId)];
    }
    const [rows] = await connection.query(query, params);
    return rows[0] || null;
  },

  // 7. Horario laboral
  async verificarHorarioLaboral(Id_Veterinario, FechaHora) {
    const fecha     = new Date(FechaHora);
    const hora      = fecha.getHours();
    const diaSemana = fecha.getDay();
    if (diaSemana === 0 || diaSemana === 6)
      return { disponible: false, mensaje: 'Los veterinarios no atienden los fines de semana.' };
    if (hora < 8 || hora >= 18)
      return { disponible: false, mensaje: 'El horario de atención es de 8:00 a 18:00 horas.' };
    return { disponible: true };
  },

  // ── Para veterinario y mascota ────────────────────────────────
  async findByVeterinario(idVeterinario) {
    const [rows] = await connection.query(CitasQueries.FIND_BY_VETERINARIO, [Number(idVeterinario)]);
    return rows;
  },

  async findByMascotaId(idMascota) {
    const [rows] = await connection.query(CitasQueries.FIND_BY_MASCOTA_ID, [Number(idMascota)]);
    return rows;
  },
};

module.exports = CitasRepository;