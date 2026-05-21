// ============================================================
//  CAPA: Service
//  Archivo: auditoria.service.js
//  Módulo: Auditoría de Acciones
// ============================================================

const auditoriaRepository = require('../repository/auditoria.repository');

const AuditoriaService = {

  async registrarAccion(data) {
    const { usuario_id, modulo, accion, descripcion, ip, referencia_id } = data;

    if (!usuario_id) {
      throw { status: 400, message: 'El usuario es obligatorio' };
    }
    if (!modulo) {
      throw { status: 400, message: 'El módulo es obligatorio' };
    }
    if (!accion) {
      throw { status: 400, message: 'La acción es obligatoria' };
    }

    const nuevaAccion = await auditoriaRepository.createAccion({
      usuario_id,
      modulo,
      accion,
      descripcion: descripcion || null,
      ip: ip || null,
      referencia_id: referencia_id || null
    });

    return nuevaAccion;
  },

  // Obtener todas las acciones (con filtros y paginación)
  async getAllAcciones(filtros = {}, page = 1, limit = 20) {
    const result = await auditoriaRepository.findAllAcciones(filtros, page, limit);
    return result;
  },

  // Obtener acciones por usuario (con paginación)
  async getAccionesByUsuario(usuario_id, page = 1, limit = 20) {
    if (!usuario_id) {
      throw { status: 400, message: 'El ID del usuario es obligatorio' };
    }
    const result = await auditoriaRepository.findAccionesByUsuario(usuario_id, page, limit);
    return result;
  },

  // Obtener acciones por módulo (con paginación)
  async getAccionesByModulo(modulo, page = 1, limit = 20) {
    if (!modulo) {
      throw { status: 400, message: 'El módulo es obligatorio' };
    }
    const result = await auditoriaRepository.findAccionesByModulo(modulo, page, limit);
    return result;
  },

  // Obtener acciones por acción (con paginación)
  async getAccionesByAccion(accion, page = 1, limit = 20) {
    if (!accion) {
      throw { status: 400, message: 'La acción es obligatoria' };
    }
    const result = await auditoriaRepository.findAccionesByAccion(accion, page, limit);
    return result;
  },

  // Obtener acciones por rango de fechas (con paginación)
  async getAccionesByFechaRango(fecha_inicio, fecha_fin, page = 1, limit = 20) {
    if (!fecha_inicio || !fecha_fin) {
      throw { status: 400, message: 'Las fechas de inicio y fin son obligatorias' };
    }
    const result = await auditoriaRepository.findAccionesByFechaRango(fecha_inicio, fecha_fin, page, limit);
    return result;
  },

  async getCountAccionesByModulo() {
    const conteo = await auditoriaRepository.countAccionesByModulo();
    return conteo;
  },

  async getCountAccionesByUsuario() {
    const conteo = await auditoriaRepository.countAccionesByUsuario();
    return conteo;
  }
};

module.exports = AuditoriaService;