// ============================================================
//  CAPA: Service
//  Archivo: vacunas.service.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const vacunasRepository = require('../repository/vacunas.repository');
const auditoriaService = require('./auditoria.service');

const VacunasService = {

  // Crear vacuna aplicada
  async createVacuna(data, usuario_id, ip) {
    // Validaciones
    if (!data.mascota_id) {
      throw { status: 400, message: 'La mascota es obligatoria' };
    }
    if (!data.nombre_vacuna) {
      throw { status: 400, message: 'El nombre de la vacuna es obligatorio' };
    }
    if (!data.fecha_aplicacion) {
      throw { status: 400, message: 'La fecha de aplicación es obligatoria' };
    }
    if (!data.veterinario_id) {
      throw { status: 400, message: 'El veterinario es obligatorio' };
    }

    // Validar que la fecha no sea futura
    const fechaAplicacion = new Date(data.fecha_aplicacion);
    if (fechaAplicacion > new Date()) {
      throw { status: 400, message: 'La fecha de aplicación no puede ser futura' };
    }

    // Validar que la próxima dosis sea posterior a la fecha de aplicación
    if (data.proxima_dosis) {
      const proximaDosis = new Date(data.proxima_dosis);
      if (proximaDosis <= fechaAplicacion) {
        throw { status: 400, message: 'La próxima dosis debe ser posterior a la fecha de aplicación' };
      }
    }

    const nuevaVacuna = await vacunasRepository.createVacuna({
      mascota_id: data.mascota_id,
      nombre_vacuna: data.nombre_vacuna,
      fecha_aplicacion: data.fecha_aplicacion,
      proxima_dosis: data.proxima_dosis || null,
      lote: data.lote || null,
      observaciones: data.observaciones || null,
      veterinario_id: data.veterinario_id
    });

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'vacunas',
      accion: 'CREATE',
      descripcion: `Registró vacuna "${data.nombre_vacuna}" para mascota ID ${data.mascota_id}`,
      ip,
      referencia_id: nuevaVacuna.id
    });

    return nuevaVacuna;
  },

  // Obtener vacuna por ID
  async getVacunaById(id) {
    const vacuna = await vacunasRepository.findVacunaById(id);
    if (!vacuna) {
      throw { status: 404, message: `No existe una vacuna con ID ${id}` };
    }
    return vacuna;
  },

  // Obtener vacunas por mascota (CON ORDENAMIENTO DINÁMICO)
  async getVacunasByMascota(mascota_id, order_by = 'fecha_aplicacion', order = 'DESC') {
    // Validar parámetros de ordenamiento
    const ordenesPermitidos = ['fecha_aplicacion', 'proxima_dosis', 'nombre_vacuna', 'id', 'lote'];
    if (!ordenesPermitidos.includes(order_by)) {
      order_by = 'fecha_aplicacion';
    }
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const vacunas = await vacunasRepository.findVacunasByMascota(mascota_id, order_by, order);
    return vacunas;
  },

  // Actualizar vacuna
  async updateVacuna(id, data, usuario_id, ip) {
    const vacuna = await vacunasRepository.findVacunaById(id);
    if (!vacuna) {
      throw { status: 404, message: `No existe una vacuna con ID ${id}` };
    }

    // Validar fechas si se están actualizando
    if (data.fecha_aplicacion) {
      const fechaAplicacion = new Date(data.fecha_aplicacion);
      if (fechaAplicacion > new Date()) {
        throw { status: 400, message: 'La fecha de aplicación no puede ser futura' };
      }
    }

    if (data.proxima_dosis) {
      const fechaAplicacion = new Date(data.fecha_aplicacion || vacuna.fecha_aplicacion);
      const proximaDosis = new Date(data.proxima_dosis);
      if (proximaDosis <= fechaAplicacion) {
        throw { status: 400, message: 'La próxima dosis debe ser posterior a la fecha de aplicación' };
      }
    }

    const updated = await vacunasRepository.updateVacuna(id, {
      nombre_vacuna: data.nombre_vacuna || vacuna.nombre_vacuna,
      fecha_aplicacion: data.fecha_aplicacion || vacuna.fecha_aplicacion,
      proxima_dosis: data.proxima_dosis !== undefined ? data.proxima_dosis : vacuna.proxima_dosis,
      lote: data.lote !== undefined ? data.lote : vacuna.lote,
      observaciones: data.observaciones !== undefined ? data.observaciones : vacuna.observaciones
    });

    if (updated === 0) {
      throw { status: 500, message: 'Error al actualizar la vacuna' };
    }

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'vacunas',
      accion: 'UPDATE',
      descripcion: `Actualizó vacuna ID ${id} para mascota ID ${vacuna.mascota_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Vacuna actualizada exitosamente' };
  },

  // Eliminar vacuna (soft delete)
  async deleteVacuna(id, usuario_id, ip) {
    const vacuna = await vacunasRepository.findVacunaById(id);
    if (!vacuna) {
      throw { status: 404, message: `No existe una vacuna con ID ${id}` };
    }

    await vacunasRepository.deleteVacuna(id);

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'vacunas',
      accion: 'DELETE',
      descripcion: `Eliminó vacuna "${vacuna.nombre_vacuna}" para mascota ID ${vacuna.mascota_id}`,
      ip,
      referencia_id: id
    });

    return { id, message: 'Vacuna eliminada exitosamente' };
  },

  // Obtener alertas de vacunas próximas
  async getAlertasVacunas() {
    const alertas = await vacunasRepository.findAlertasVacunas();
    return alertas;
  },

  // Marcar notificación como enviada
  async marcarNotificacion(vacuna_id, propietario_id, usuario_id, ip) {
    const vacuna = await vacunasRepository.findVacunaById(vacuna_id);
    if (!vacuna) {
      throw { status: 404, message: `No existe una vacuna con ID ${vacuna_id}` };
    }

    // Verificar si ya fue notificada
    const notificacionExistente = await vacunasRepository.checkNotificacion(vacuna_id);
    if (notificacionExistente) {
      throw { status: 409, message: 'Esta vacuna ya fue notificada anteriormente' };
    }

    await vacunasRepository.marcarNotificacion(vacuna_id, propietario_id);

    // Registrar en auditoría
    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'vacunas',
      accion: 'NOTIFICACION',
      descripcion: `Envió notificación de vacuna próxima "${vacuna.nombre_vacuna}" a propietario ID ${propietario_id}`,
      ip,
      referencia_id: vacuna_id
    });

    return { message: 'Notificación registrada exitosamente' };
  }
};

module.exports = VacunasService;