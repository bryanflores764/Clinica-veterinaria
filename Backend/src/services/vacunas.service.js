// ============================================================
//  CAPA: Service
//  Archivo: vacunas.service.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const vacunasRepository = require('../repository/vacunas.repository');
const auditoriaService = require('./auditoria.service');
const { enviarNotificacionVacuna } = require('../middlewares/notificacionVacuna.middleware');

const VacunasService = {

  // Crear vacuna aplicada
  async createVacuna(data, usuario_id, ip) {
    if (!data.mascota_id)       throw { status: 400, message: 'La mascota es obligatoria' };
    if (!data.nombre_vacuna)    throw { status: 400, message: 'El nombre de la vacuna es obligatorio' };
    if (!data.fecha_aplicacion) throw { status: 400, message: 'La fecha de aplicación es obligatoria' };
    if (!data.veterinario_id)   throw { status: 400, message: 'El veterinario es obligatorio' };

    const fechaAplicacion = new Date(data.fecha_aplicacion);
    if (fechaAplicacion > new Date()) {
      throw { status: 400, message: 'La fecha de aplicación no puede ser futura' };
    }

    if (data.proxima_dosis) {
      const proximaDosis = new Date(data.proxima_dosis);
      if (proximaDosis <= fechaAplicacion) {
        throw { status: 400, message: 'La próxima dosis debe ser posterior a la fecha de aplicación' };
      }
    }

    const nuevaVacuna = await vacunasRepository.createVacuna({
      mascota_id:       data.mascota_id,
      nombre_vacuna:    data.nombre_vacuna,
      fecha_aplicacion: data.fecha_aplicacion,
      proxima_dosis:    data.proxima_dosis    || null,
      lote:             data.lote             || null,
      observaciones:    data.observaciones    || null,
      veterinario_id:   data.veterinario_id
    });

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
    if (!vacuna) throw { status: 404, message: `No existe una vacuna con ID ${id}` };
    return vacuna;
  },

  // Obtener vacunas por mascota (con ordenamiento dinámico)
  async getVacunasByMascota(mascota_id, order_by = 'fecha_aplicacion', order = 'DESC') {
    const ordenesPermitidos = ['fecha_aplicacion', 'proxima_dosis', 'nombre_vacuna', 'id', 'lote'];
    if (!ordenesPermitidos.includes(order_by)) order_by = 'fecha_aplicacion';
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return await vacunasRepository.findVacunasByMascota(mascota_id, order_by, order);
  },

  // Actualizar vacuna
  async updateVacuna(id, data, usuario_id, ip) {
    const vacuna = await vacunasRepository.findVacunaById(id);
    if (!vacuna) throw { status: 404, message: `No existe una vacuna con ID ${id}` };

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
      nombre_vacuna:    data.nombre_vacuna    || vacuna.nombre_vacuna,
      fecha_aplicacion: data.fecha_aplicacion || vacuna.fecha_aplicacion,
      proxima_dosis:    data.proxima_dosis    !== undefined ? data.proxima_dosis    : vacuna.proxima_dosis,
      lote:             data.lote             !== undefined ? data.lote             : vacuna.lote,
      observaciones:    data.observaciones    !== undefined ? data.observaciones    : vacuna.observaciones
    });

    if (updated === 0) throw { status: 500, message: 'Error al actualizar la vacuna' };

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
    if (!vacuna) throw { status: 404, message: `No existe una vacuna con ID ${id}` };

    await vacunasRepository.deleteVacuna(id);

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
    return await vacunasRepository.findAlertasVacunas();
  },

  // Marcar notificación como enviada y enviar correo
  async marcarNotificacion(vacuna_id, usuario_id, ip) {

    // findVacunaById ya hace JOIN con mascotas y propietarios,
    // por lo que trae: propietario_correo, propietario_nombre, mascota_nombre
    const vacuna = await vacunasRepository.findVacunaById(vacuna_id);
    if (!vacuna) {
      throw { status: 404, message: `No existe una vacuna con ID ${vacuna_id}` };
    }

    if (!vacuna.propietario_correo) {
      throw { status: 400, message: 'El propietario no tiene correo registrado' };
    }

    const notificacionExistente = await vacunasRepository.checkNotificacion(vacuna_id);
    if (notificacionExistente) {
      throw { status: 409, message: 'Esta vacuna ya fue notificada anteriormente' };
    }

    const diasRestantes = Math.ceil(
      (new Date(vacuna.proxima_dosis) - new Date()) / (1000 * 60 * 60 * 24)
    );

    // ✅ El middleware recibe todo en un solo objeto
    const resultadoEmail = await enviarNotificacionVacuna({
      propietarioCorreo: vacuna.propietario_correo,
      propietarioNombre: vacuna.propietario_nombre,   // ← nombre para el saludo en la carta
      mascotaNombre:     vacuna.mascota_nombre,
      vacunaNombre:      vacuna.nombre_vacuna,
      proximaDosis:      vacuna.proxima_dosis,
      diasRestantes
    });

    const mascota = await vacunasRepository.findMascotaById(vacuna.mascota_id);
    await vacunasRepository.marcarNotificacion(vacuna_id, mascota.Id_Propietario);

    await auditoriaService.registrarAccion({
      usuario_id,
      modulo: 'vacunas',
      accion: 'NOTIFICACION',
      descripcion: `Envió notificación de vacuna "${vacuna.nombre_vacuna}" a ${vacuna.propietario_correo}`,
      ip,
      referencia_id: vacuna_id
    }).catch(err => console.error('Error en auditoría:', err.message));

    return {
      message: `Notificación enviada a ${vacuna.propietario_correo}`,
      email: resultadoEmail
    };
  }
};

module.exports = VacunasService;