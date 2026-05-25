// ============================================================
//  CAPA: Service
//  Archivo: historial.service.js
//  Módulos: Historial Clínico y Consultas Médicas
// ============================================================

const historialRepository = require('../repository/historial.repository');
const auditoriaService = require('./auditoria.service');

const HistorialService = {

  // ============================================================
  //  HISTORIAL CLÍNICO
  // ============================================================

  // Crear historial clínico
  async createHistorial(data, usuario_id, ip) {
    // Validaciones
    if (!data.mascota_id) {
      throw { status: 400, message: 'La mascota es obligatoria' };
    }
    if (!data.motivo) {
      throw { status: 400, message: 'El motivo de la consulta es obligatorio' };
    }
    if (!data.veterinario_id) {
      throw { status: 400, message: 'El veterinario es obligatorio' };
    }

    // Verificar si la mascota ya tiene un historial activo
    const historialExistente = await historialRepository.checkHistorialActivo(data.mascota_id);
    if (historialExistente) {
      throw { status: 409, message: 'La mascota ya tiene un historial clínico activo' };
    }

    const nuevoHistorial = await historialRepository.createHistorial({
      mascota_id: data.mascota_id,
      motivo: data.motivo,
      diagnostico_inicial: data.diagnostico_inicial || null,
      observaciones: data.observaciones || null,
      veterinario_id: data.veterinario_id
    });

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'historial_clinico',
      accion: 'CREATE',
      descripcion: `Creó historial clínico para mascota ID ${data.mascota_id}`,
      ip,
      referencia_id: nuevoHistorial.id
    });

    return nuevoHistorial;
  },

  // Obtener historial por ID
  async getHistorialById(id) {
    const historial = await historialRepository.findHistorialById(id);
    if (!historial) {
      throw { status: 404, message: `No existe un historial clínico con ID ${id}` };
    }
    return historial;
  },

  // Obtener historial por mascota
  async getHistorialByMascota(mascota_id) {
    const historial = await historialRepository.findHistorialByMascota(mascota_id);
    if (!historial || historial.length === 0) {
      throw { status: 404, message: `La mascota no tiene un historial clínico` };
    }
    return historial;
  },

  // Actualizar historial clínico
  async updateHistorial(id, data, usuario_id, ip) {
    const historial = await historialRepository.findHistorialById(id);
    if (!historial) {
      throw { status: 404, message: `No existe un historial clínico con ID ${id}` };
    }

    const updated = await historialRepository.updateHistorial(id, {
      motivo: data.motivo || historial.motivo,
      diagnostico_inicial: data.diagnostico_inicial || historial.diagnostico_inicial,
      observaciones: data.observaciones || historial.observaciones
    });

    if (updated === 0) {
      throw { status: 500, message: 'Error al actualizar el historial clínico' };
    }

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'historial_clinico',
      accion: 'UPDATE',
      descripcion: `Actualizó historial clínico ID ${id} de mascota ID ${historial.mascota_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Historial clínico actualizado exitosamente' };
  },

  // Eliminar historial clínico (soft delete)
  async deleteHistorial(id, usuario_id, ip) {
    const historial = await historialRepository.findHistorialById(id);
    if (!historial) {
      throw { status: 404, message: `No existe un historial clínico con ID ${id}` };
    }

    await historialRepository.deleteHistorial(id);

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'historial_clinico',
      accion: 'DELETE',
      descripcion: `Eliminó historial clínico ID ${id} de mascota ID ${historial.mascota_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Historial clínico eliminado exitosamente' };
  },

  // ============================================================
  //  CONSULTAS MÉDICAS
  // ============================================================

  // Crear consulta médica
  async createConsulta(data, usuario_id, ip) {
    // Validaciones
    if (!data.historial_id) {
      throw { status: 400, message: 'El historial clínico es obligatorio' };
    }
    if (!data.diagnostico) {
      throw { status: 400, message: 'El diagnóstico es obligatorio' };
    }
    if (!data.veterinario_id) {
      throw { status: 400, message: 'El veterinario es obligatorio' };
    }

    // Verificar que el historial existe
    const historial = await historialRepository.findHistorialById(data.historial_id);
    if (!historial) {
      throw { status: 404, message: `No existe un historial clínico con ID ${data.historial_id}` };
    }

    const nuevaConsulta = await historialRepository.createConsulta({
      historial_id: data.historial_id,
      sintomas: data.sintomas || null,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento || null,
      observaciones: data.observaciones || null,
      veterinario_id: data.veterinario_id
    });

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'consultas_medicas',
      accion: 'CREATE',
      descripcion: `Agregó consulta médica al historial ID ${data.historial_id}`,
      ip,
      referencia_id: nuevaConsulta.id
    });

    return nuevaConsulta;
  },

  // Obtener consulta por ID
  async getConsultaById(id) {
    const consulta = await historialRepository.findConsultaById(id);
    if (!consulta) {
      throw { status: 404, message: `No existe una consulta médica con ID ${id}` };
    }
    return consulta;
  },

  // Obtener consultas por historial
  async getConsultasByHistorial(historial_id) {
    const consultas = await historialRepository.findConsultasByHistorial(historial_id);
    return consultas;
  },

  // Actualizar consulta médica
  async updateConsulta(id, data, usuario_id, ip) {
    const consulta = await historialRepository.findConsultaById(id);
    if (!consulta) {
      throw { status: 404, message: `No existe una consulta médica con ID ${id}` };
    }

    const updated = await historialRepository.updateConsulta(id, {
      sintomas: data.sintomas || consulta.sintomas,
      diagnostico: data.diagnostico || consulta.diagnostico,
      tratamiento: data.tratamiento || consulta.tratamiento,
      observaciones: data.observaciones || consulta.observaciones
    });

    if (updated === 0) {
      throw { status: 500, message: 'Error al actualizar la consulta médica' };
    }

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'consultas_medicas',
      accion: 'UPDATE',
      descripcion: `Actualizó consulta médica ID ${id} del historial ID ${consulta.historial_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Consulta médica actualizada exitosamente' };
  },

  // Eliminar consulta médica (soft delete)
  async deleteConsulta(id, usuario_id, ip) {
    const consulta = await historialRepository.findConsultaById(id);
    if (!consulta) {
      throw { status: 404, message: `No existe una consulta médica con ID ${id}` };
    }

    await historialRepository.deleteConsulta(id);

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'consultas_medicas',
      accion: 'DELETE',
      descripcion: `Eliminó consulta médica ID ${id} del historial ID ${consulta.historial_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Consulta médica eliminada exitosamente' };
  }
};

module.exports = HistorialService;