// ============================================================
//  CAPA: Service
//  Archivo: citas.service.js
// ============================================================

const citasRepository = require('../repository/citas.repository');

// ── Función auxiliar para validar conflictos de horario ─────
const validarConflictosCita = async (Id_Mascota, Id_Veterinario, FechaHora, IdTipoConsulta, excludeId = null) => {
  const fechaSolicitada = new Date(FechaHora);
  
  // 0. Verificar horario laboral del veterinario
  const horario = await citasRepository.verificarHorarioLaboral(Id_Veterinario, FechaHora);
  if (!horario.disponible) {
    throw { status: 409, message: horario.mensaje };
  }
  
  // 1. Verificar si la mascota ya tiene una cita en la MISMA HORA
  const citaMascotaMismaHora = await citasRepository.findByMascotaAndFechaHora(Id_Mascota, FechaHora, excludeId);
  if (citaMascotaMismaHora) {
    throw { 
      status: 409, 
      message: `La mascota ya tiene una cita agendada para el ${fechaSolicitada.toLocaleString()}. No puede tener dos citas a la misma hora.` 
    };
  }

  // 2. Verificar si la mascota ya tiene una cita del MISMO TIPO en el mismo día
  const citaMascotaMismoTipo = await citasRepository.findByMascotaFechaAndTipo(Id_Mascota, FechaHora, IdTipoConsulta, excludeId);
  
  if (citaMascotaMismoTipo) {
    throw { 
      status: 409, 
      message: `La mascota ya tiene una cita de este tipo (${citaMascotaMismoTipo.Tipo_Consulta}) agendada para el día ${fechaSolicitada.toLocaleDateString()}. No puede repetir el mismo tipo de consulta el mismo día.` 
    };
  }

  // 3. Verificar si el veterinario ya tiene una cita en ese horario (con 15 min de diferencia)
  const citasVeterinario = await citasRepository.findByVeterinarioAndFechaRango(Id_Veterinario, FechaHora, excludeId);
  
  if (citasVeterinario && citasVeterinario.length > 0) {
    for (const citaExistente of citasVeterinario) {
      const fechaExistente = new Date(citaExistente.FechaHora);
      const diferenciaMinutos = Math.abs((fechaExistente - fechaSolicitada) / 60000);
      
      if (diferenciaMinutos < 15) {
        throw { 
          status: 409, 
          message: `El veterinario ya tiene una cita programada a las ${fechaExistente.toLocaleTimeString()}. Debe haber al menos 15 minutos de diferencia.` 
        };
      }
    }
  }

  // 4. Verificar cita duplicada exacta
  const citaDuplicada = await citasRepository.findDuplicada(Id_Mascota, Id_Veterinario, FechaHora, excludeId);
  if (citaDuplicada) {
    throw { 
      status: 409, 
      message: `Ya existe una cita agendada con la misma mascota, veterinario y horario.` 
    };
  }

  // 5. Verificar que la fecha no sea en el pasado
  if (fechaSolicitada < new Date()) {
    throw { status: 409, message: 'No se pueden agendar citas en fechas pasadas.' };
  }

  return true;
};

// ── CREAR CITA ────────────────────────────────────────────────
const createCita = async (Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  if (!Id_Mascota || !Id_Veterinario || !IdTipoConsulta || !IdEstadoCita || !FechaHora) {
    throw { status: 400, message: 'Todos los campos son obligatorios.' };
  }

  if (isNaN(Date.parse(FechaHora))) {
    throw { status: 400, message: 'FechaHora no tiene un formato válido (ej: 2026-04-20T10:00:00).' };
  }

  await validarConflictosCita(Id_Mascota, Id_Veterinario, FechaHora, IdTipoConsulta);

  return await citasRepository.create({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
};

// ── ACTUALIZAR CITA ────────────────────────────────────────────
const updateCita = async (id, Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }

  const datos = {
    Id_Mascota:     Id_Mascota     ?? cita.Id_Mascota,
    Id_Veterinario: Id_Veterinario ?? cita.Id_Veterinario,
    IdTipoConsulta: IdTipoConsulta ?? cita.IdTipoConsulta,
    IdEstadoCita:   IdEstadoCita   ?? cita.IdEstadoCita,
    FechaHora:      FechaHora      ?? cita.FechaHora,
  };

  if (datos.FechaHora && isNaN(Date.parse(datos.FechaHora))) {
    throw { status: 400, message: 'FechaHora no tiene un formato válido.' };
  }

  await validarConflictosCita(datos.Id_Mascota, datos.Id_Veterinario, datos.FechaHora, datos.IdTipoConsulta, id);

  await citasRepository.update(id, datos);
  return { id, ...datos };
};

// ── RESTO DE FUNCIONES ─────────────────────────────────────────
const getAllCitas = async () => {
  const citas = await citasRepository.findAll();
  return citas;
};

const getCitaById = async (id) => {
  const cita = await citasRepository.findById(id);
  return cita;
};

const getCitasByMascota = async (idMascota) => {
  const citas = await citasRepository.findByMascota(idMascota);
  return citas;
};

const updateEstadoCita = async (id, IdEstadoCita) => {
  if (!IdEstadoCita || isNaN(IdEstadoCita)) {
    throw { status: 400, message: 'IdEstadoCita es obligatorio y debe ser un número.' };
  }

  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }

  await citasRepository.updateEstado(id, { IdEstadoCita });
  return { id, IdEstadoCita, message: 'Estado de cita actualizado exitosamente.' };
};

const deleteCita = async (id) => {
  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }

  await citasRepository.delete(id);
  return { id, mensaje: `Cita del ${cita.FechaHora} eliminada exitosamente.` };
};


// ============================================================
//  NUEVAS FUNCIONES (AGREGAR)
// ============================================================

// Obtener citas por veterinario
const getCitasByVeterinario = async (idVeterinario) => {
  if (!idVeterinario) {
    throw { status: 400, message: 'El ID del veterinario es obligatorio' };
  }
  const citas = await citasRepository.findByVeterinario(idVeterinario);
  return citas;
};

// Obtener citas por mascota (historial)
const getCitasByMascotaId = async (idMascota) => {
  if (!idMascota) {
    throw { status: 400, message: 'El ID de la mascota es obligatorio' };
  }
  const citas = await citasRepository.findByMascotaId(idMascota);
  return citas;
};

// Completar cita (cambiar estado a Completada = 4)
const completarCita = async (idCita) => {
  const cita = await citasRepository.findById(idCita);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${idCita}` };
  }
  
  if (cita.IdEstadoCita === 4) {
    throw { status: 409, message: 'La cita ya está completada' };
  }
  
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
  getCitasByVeterinario,  // ← NUEVA
  getCitasByMascotaId,    // ← NUEVA
  completarCita,          // ← NUEVA
};