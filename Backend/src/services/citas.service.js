// ============================================================
//  CAPA: Service
//  Archivo: citas.service.js
// ============================================================

const citasRepository = require('../repository/citas.repository');

const createCita = async (Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  if (!Id_Mascota || !Id_Veterinario || !IdTipoConsulta || !IdEstadoCita || !FechaHora) {
    throw { status: 400, message: 'Todos los campos son obligatorios.' };
  }

  if (isNaN(Date.parse(FechaHora))) {
    throw { status: 400, message: 'FechaHora no tiene un formato válido (ej: 2026-04-20T10:00:00).' };
  }

  return await citasRepository.create({ Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora });
};

const getAllCitas = async () => {
  const citas = await citasRepository.findAll();
  if (!citas.length) {
    throw { status: 404, message: 'No hay citas registradas.' };
  }
  return citas;
};

const getCitaById = async (id) => {
  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }
  return cita;
};

const getCitasByMascota = async (idMascota) => {
  const citas = await citasRepository.findByMascota(idMascota);
  if (!citas.length) {
    throw { status: 404, message: `No hay citas registradas para la mascota con Id ${idMascota}.` };
  }
  return citas;
};

const updateCita = async (id, Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora) => {
  const cita = await citasRepository.findById(id);
  if (!cita) {
    throw { status: 404, message: `No existe una cita con IdCita ${id}.` };
  }

  // Usa el valor enviado o, si no viene, conserva el que ya tiene la cita
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

  await citasRepository.update(id, datos);
  return { id, ...datos };
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

module.exports = {
  createCita,
  getAllCitas,
  getCitaById,
  getCitasByMascota,
  updateCita,
  updateEstadoCita,
  deleteCita,
};