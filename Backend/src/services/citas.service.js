// ============================================================
//  CAPA: Service
//  Archivo: citas.service.js (VERSIÓN CORREGIDA CON MENSAJES AMIGABLES)
// ============================================================

const citasRepository = require('../repository/citas.repository');

// ── Función para manejar errores de duplicados ──
const manejarErrorDuplicado = (error) => {
  // Error de MySQL por índice único
  if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('Duplicate entry'))) {
    // Extraer información del error si es posible
    const match = error.message.match(/Duplicate entry '(.*?)' for key '(.*?)'/);
    if (match) {
      const valor = match[1];
      const indice = match[2];
      
      if (indice && indice.includes('idx_unique_vet_hora')) {
        // Formatear el mensaje amigable
        let fechaHoraLegible = valor;
        // Si tiene formato con guiones y T, formatearlo
        if (valor.includes('-')) {
          const partes = valor.split('-');
          if (partes.length >= 3) {
            // Extraer solo la parte de fecha/hora (quitar el ID del veterinario si está al inicio)
            let fechaStr = partes.slice(1).join('-');
            fechaStr = fechaStr.replace('T', ' ');
            fechaHoraLegible = fechaStr;
          }
        }
        
        return {
          status: 409,
          message: `⚠️ El veterinario ya tiene una cita agendada para el ${fechaHoraLegible}. Por favor, selecciona otra fecha u otro horario.`
        };
      }
    }
    
    return {
      status: 409,
      message: '⚠️ Ya existe una cita con los mismos datos. No se pueden crear citas duplicadas.'
    };
  }
  
  return null;
};

// ── Función auxiliar para convertir a número válido ──
const toValidNumber = (val, fallback) => {
  if (val === null || val === undefined || val === '') {
    return fallback;
  }
  const n = Number(val);
  if (isNaN(n) || n === 0) {
    return fallback;
  }
  return n;
};

// ── Validar conflictos de horario ─────────────────────────────
const validarConflictosCita = async (Id_Mascota, Id_Veterinario, FechaHora, IdTipoConsulta, excludeId = null) => {
  const fechaSolicitada = new Date(FechaHora);

  if (!Id_Mascota || Id_Mascota <= 0) {
    throw { status: 400, message: 'ID de mascota inválido.' };
  }
  if (!Id_Veterinario || Id_Veterinario <= 0) {
    throw { status: 400, message: 'ID de veterinario inválido.' };
  }
  if (!IdTipoConsulta || IdTipoConsulta <= 0) {
    throw { status: 400, message: 'ID de tipo de consulta inválido.' };
  }

  // Horario laboral
  const horario = await citasRepository.verificarHorarioLaboral(Id_Veterinario, FechaHora);
  if (!horario.disponible) {
    throw { status: 409, message: horario.mensaje };
  }

  // Misma mascota a la misma hora exacta
  const citaMascotaMismaHora = await citasRepository.findByMascotaAndFechaHora(Id_Mascota, FechaHora, excludeId);
  if (citaMascotaMismaHora) {
    throw {
      status: 409,
      message: `La mascota ya tiene una cita agendada para el ${fechaSolicitada.toLocaleString()}. No puede tener dos citas a la misma hora.`
    };
  }

  // Veterinario ocupado en rango de 15 min
  const citasVeterinario = await citasRepository.findByVeterinarioAndFechaRango(Id_Veterinario, FechaHora, excludeId);
  if (citasVeterinario && citasVeterinario.length > 0) {
    for (const citaExistente of citasVeterinario) {
      const fechaExistente = new Date(citaExistente.FechaHora);
      const diferenciaMinutos = Math.abs((fechaExistente - fechaSolicitada) / 60000);
      if (diferenciaMinutos < 15) {
        throw {
          status: 409,
          message: `El veterinario ya tiene una cita a las ${fechaExistente.toLocaleTimeString()}. Debe haber al menos 15 minutos de diferencia.`
        };
      }
    }
  }

  // No en el pasado
  if (!excludeId || (excludeId && FechaHora !== undefined)) {
    if (fechaSolicitada < new Date()) {
      throw { status: 409, message: 'No se pueden agendar citas en fechas pasadas.' };
    }
  }

  return true;
};

// ── CREAR CITA ─────────────────────────────────────────────────
const createCita = async (Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  if (!Id_Mascota || !Id_Veterinario || !IdTipoConsulta || !IdEstadoCita || !FechaHora) {
    throw { status: 400, message: 'Todos los campos son obligatorios.' };
  }
  if (isNaN(Date.parse(FechaHora))) {
    throw { status: 400, message: 'FechaHora no tiene un formato válido.' };
  }

  await validarConflictosCita(Id_Mascota, Id_Veterinario, FechaHora, IdTipoConsulta);
  
  try {
    return await citasRepository.create({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
  } catch (error) {
    const errorAmigable = manejarErrorDuplicado(error);
    if (errorAmigable) {
      throw errorAmigable;
    }
    throw error;
  }
};

// ── ACTUALIZAR CITA ─────────────────────────────────────────────
const updateCita = async (id, Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }

  const datos = {
    Id_Mascota: toValidNumber(Id_Mascota, cita.Id_Mascota),
    Id_Veterinario: toValidNumber(Id_Veterinario, cita.Id_Veterinario),
    IdTipoConsulta: toValidNumber(IdTipoConsulta, cita.IdTipoConsulta),
    IdEstadoCita: toValidNumber(IdEstadoCita, cita.IdEstadoCita),
    FechaHora: (FechaHora && FechaHora !== '') ? FechaHora : cita.FechaHora,
  };

  if (datos.FechaHora && isNaN(Date.parse(datos.FechaHora))) {
    throw { status: 400, message: 'FechaHora no tiene un formato válido.' };
  }

  if (!datos.Id_Veterinario || datos.Id_Veterinario === 0) {
    throw { status: 400, message: 'El ID del veterinario es obligatorio.' };
  }

  await validarConflictosCita(datos.Id_Mascota, datos.Id_Veterinario, datos.FechaHora, datos.IdTipoConsulta, id);
  
  try {
    await citasRepository.update(id, datos);
    return { id: Number(id), ...datos, message: 'Cita actualizada exitosamente.' };
  } catch (error) {
    const errorAmigable = manejarErrorDuplicado(error);
    if (errorAmigable) {
      throw errorAmigable;
    }
    throw error;
  }
};

// ── RESTO DE FUNCIONES (sin cambios) ──────────────────────────
const getAllCitas = async () => await citasRepository.findAll();
const getCitaById = async (id) => await citasRepository.findById(id);
const getCitasByMascota = async (idMascota) => await citasRepository.findByMascota(idMascota);

const updateEstadoCita = async (id, IdEstadoCita) => {
  if (!IdEstadoCita || isNaN(IdEstadoCita)) {
    throw { status: 400, message: 'IdEstadoCita es obligatorio y debe ser un número.' };
  }
  const cita = await citasRepository.findById(id);
  if (!cita) throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  await citasRepository.updateEstado(id, { IdEstadoCita });
  return { id, IdEstadoCita, message: 'Estado de cita actualizado exitosamente.' };
};

const deleteCita = async (id) => {
  const cita = await citasRepository.findById(id);
  if (!cita) throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  await citasRepository.delete(id);
  return { id, mensaje: `Cita del ${cita.FechaHora} eliminada exitosamente.` };
};

const getCitasByVeterinario = async (idVeterinario) => {
  if (!idVeterinario) throw { status: 400, message: 'El ID del veterinario es obligatorio' };
  return await citasRepository.findByVeterinario(idVeterinario);
};

const getCitasByMascotaId = async (idMascota) => {
  if (!idMascota) throw { status: 400, message: 'El ID de la mascota es obligatorio' };
  return await citasRepository.findByMascotaId(idMascota);
};

const completarCita = async (idCita) => {
  const cita = await citasRepository.findById(idCita);
  if (!cita) throw { status: 404, message: `No existe una cita con IdCita ${idCita}` };
  if (cita.IdEstadoCita === 4) throw { status: 409, message: 'La cita ya está completada' };
  await citasRepository.updateEstado(idCita, { IdEstadoCita: 4 });
  return { id: idCita, estado: 'completada', message: 'Cita completada exitosamente' };
};

module.exports = {
  createCita,
  getAllCitas,
  getCitaById,
  getCitasByMascota,
  updateCita,
  updateEstadoCita,
  deleteCita,
  getCitasByVeterinario,
  getCitasByMascotaId,
  completarCita,
};