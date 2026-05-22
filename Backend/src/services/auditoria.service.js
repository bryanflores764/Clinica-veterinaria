// ============================================================
//  CAPA: Service
//  Archivo: auditoria.service.js
//  Módulo: Auditoría de Acciones
// ============================================================

const auditoriaRepository = require('../repository/auditoria.repository');
const connection = require('../database/connection');

const AuditoriaService = {
async registrarAccion(data) {
  const { usuario_id, modulo, accion, descripcion, ip, referencia_id } = data;

  // ✅ Validaciones básicas
  if (!modulo) {
    throw { status: 400, message: 'El módulo es obligatorio' };
  }
  if (!accion) {
    throw { status: 400, message: 'La acción es obligatoria' };
  }

  let idUsuarioFinal = usuario_id;

  // ✅ Si no hay usuario_id, usar ID 1
  if (!idUsuarioFinal) {
    console.log("⚠️ Auditoría: usuario_id no proporcionado, usando ID 1");
    idUsuarioFinal = 1;
  }

  // ✅ Verificar que el usuario existe
  try {
    const [usuario] = await connection.query(
      "SELECT id FROM usuarios WHERE id = ? AND activo = 1",
      [idUsuarioFinal]
    );
    
    if (!usuario || usuario.length === 0) {
      console.log(`⚠️ Usuario ID ${idUsuarioFinal} no existe, intentando con ID 1`);
      
      // Intentar con usuario ID 1
      const [admin] = await connection.query("SELECT id FROM usuarios WHERE id = 1 AND activo = 1");
      
      if (admin && admin.length > 0) {
        idUsuarioFinal = 1;
        console.log("✅ Usando administrador ID 1 para auditoría");
      } else {
        console.log("❌ No hay usuarios activos disponibles para auditoría");
        return { id: null, omitido: true };
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar usuario:", error.message);
    return { id: null, omitido: true };
  }

  // ✅ Insertar la acción
  const nuevaAccion = await auditoriaRepository.createAccion({
    usuario_id: idUsuarioFinal,
    modulo,
    accion,
    descripcion: descripcion || null,
    ip: ip || null,
    referencia_id: referencia_id || null
  });

  console.log(`✅ Auditoría registrada: ${accion} en ${modulo} por usuario ${idUsuarioFinal}`);
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