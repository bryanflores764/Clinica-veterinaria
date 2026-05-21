// ============================================================
//  CAPA: Service
//  Archivo: auditoria.service.js
//  Módulo: Auditoría de Acciones
// ============================================================

const auditoriaRepository = require('../repository/auditoria.repository');

const AuditoriaService = {

  // Registrar una acción (llamado desde otros servicios)
  async registrarAccion(data) {
    const { usuario_id, modulo, accion, descripcion, ip, referencia_id } = data;

    // Validaciones
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

  // Obtener todas las acciones (con filtros)
  async getAllAcciones(filtros = {}) {
    const acciones = await auditoriaRepository.findAllAcciones(filtros);
    return acciones;
  },

  // Obtener acciones por usuario
  async getAccionesByUsuario(usuario_id) {
    if (!usuario_id) {
      throw { status: 400, message: 'El ID del usuario es obligatorio' };
    }
    const acciones = await auditoriaRepository.findAccionesByUsuario(usuario_id);
    return acciones;
  },

  // Obtener acciones por módulo
  async getAccionesByModulo(modulo) {
    if (!modulo) {
      throw { status: 400, message: 'El módulo es obligatorio' };
    }
    const acciones = await auditoriaRepository.findAccionesByModulo(modulo);
    return acciones;
  },

  // Obtener acciones por acción
  async getAccionesByAccion(accion) {
    if (!accion) {
      throw { status: 400, message: 'La acción es obligatoria' };
    }
    const acciones = await auditoriaRepository.findAccionesByAccion(accion);
    return acciones;
  },

  // Obtener acciones por rango de fechas
  async getAccionesByFechaRango(fecha_inicio, fecha_fin) {
    if (!fecha_inicio || !fecha_fin) {
      throw { status: 400, message: 'Las fechas de inicio y fin son obligatorias' };
    }
    const acciones = await auditoriaRepository.findAccionesByFechaRango(fecha_inicio, fecha_fin);
    return acciones;
  },

  // Dashboard: Contar acciones por módulo
  async getCountAccionesByModulo() {
    const conteo = await auditoriaRepository.countAccionesByModulo();
    return conteo;
  },

  // Dashboard: Contar acciones por usuario
  async getCountAccionesByUsuario() {
    const conteo = await auditoriaRepository.countAccionesByUsuario();
    return conteo;
  }
};

module.exports = AuditoriaService;