// ============================================================
//  CAPA: Service
//  Archivo: permisos.service.js
//
//  Responsabilidad:
//    • Contiene toda la lógica de negocio del módulo Permisos.
//    • Valida datos de entrada antes de llamar al repository.
//    • Lanza errores de negocio con mensajes claros (los captura el controller).
//    • No conoce req / res; es independiente de Express.
// ============================================================

const PermisosRepository = require('../repository/permisos.repository');

// Acciones válidas que se pueden consultar en un permiso
const ACCIONES_VALIDAS = ['Puede_Crear', 'Puede_Leer', 'Puede_Editar', 'Puede_Eliminar'];

const PermisosService = {
  /**
   * Crea o actualiza un permiso para un rol + módulo.
   * Si la combinación RolId+Modulo ya existe → actualiza.
   * Si no existe → inserta.
   *
   * @param {object} datos - { RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar }
   * @returns {object} { mensaje, insertId? }
   */
  async asignarPermiso(datos) {
    const { RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar } = datos;

    // --- Validaciones de negocio ---
    if (!RolId || isNaN(Number(RolId))) {
      const error = new Error('RolId es obligatorio y debe ser un número válido.');
      error.statusCode = 400;
      throw error;
    }

    if (!Modulo || typeof Modulo !== 'string' || Modulo.trim() === '') {
      const error = new Error('Modulo es obligatorio y debe ser una cadena no vacía.');
      error.statusCode = 400;
      throw error;
    }

    // Los campos BIT son opcionales; si no se envían se interpretan como 0
    const permisoNormalizado = {
      RolId         : Number(RolId),
      Modulo        : Modulo.trim(),
      Puede_Crear   : Puede_Crear   ? 1 : 0,
      Puede_Leer    : Puede_Leer    ? 1 : 0,
      Puede_Editar  : Puede_Editar  ? 1 : 0,
      Puede_Eliminar: Puede_Eliminar ? 1 : 0,
    };

    const result = await PermisosRepository.upsert(permisoNormalizado);

    // affectedRows: 1 → INSERT nuevo | 2 → UPDATE existente | 0 → sin cambios
    const accion = result.affectedRows === 1 ? 'creado' : 'actualizado';

    return {
      mensaje   : `Permiso ${accion} correctamente.`,
      insertId  : result.insertId || null,
      afectados : result.affectedRows,
    };
  },

  /**
   * Verifica si un rol tiene una acción específica sobre un módulo.
   * Usado internamente por el middleware verificarPermiso.
   *
   * @param {number} rolId
   * @param {string} modulo
   * @param {string} accion  - Debe ser una de ACCIONES_VALIDAS
   * @returns {boolean}
   */
  async tienePermiso(rolId, modulo, accion) {
    if (!ACCIONES_VALIDAS.includes(accion)) {
      const error = new Error(`Acción inválida: "${accion}". Debe ser una de: ${ACCIONES_VALIDAS.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const permiso = await PermisosRepository.findByRolAndModulo(rolId, modulo);

    if (!permiso) return false;

    // Los campos BIT en mysql2 llegan como Buffer(1); convertimos a boolean
    const valor = permiso[accion];
    return valor === 1 || (Buffer.isBuffer(valor) && valor[0] === 1);
  },

  /**
   * Obtiene todos los permisos de un rol.
   * @param {number} rolId
   * @returns {Array}
   */
  async obtenerPermisosPorRol(rolId) {
    if (!rolId || isNaN(Number(rolId))) {
      const error = new Error('RolId es obligatorio y debe ser un número válido.');
      error.statusCode = 400;
      throw error;
    }

    return await PermisosRepository.findAllByRol(Number(rolId));
  },

  /**
   * Obtiene todos los permisos (para panel de administración).
   * @returns {Array}
   */
  async obtenerTodosLosPermisos() {
    return await PermisosRepository.findAll();
  },

  /**
   * Elimina el permiso de un rol sobre un módulo.
   * @param {number} rolId
   * @param {string} modulo
   * @returns {object}
   */
  async eliminarPermiso(rolId, modulo) {
    if (!rolId || isNaN(Number(rolId))) {
      const error = new Error('RolId es obligatorio y debe ser un número válido.');
      error.statusCode = 400;
      throw error;
    }

    if (!modulo || modulo.trim() === '') {
      const error = new Error('Modulo es obligatorio.');
      error.statusCode = 400;
      throw error;
    }

    const result = await PermisosRepository.deleteByRolAndModulo(Number(rolId), modulo.trim());

    if (result.affectedRows === 0) {
      const error = new Error('No se encontró ningún permiso con esos parámetros.');
      error.statusCode = 404;
      throw error;
    }

    return { mensaje: 'Permiso eliminado correctamente.' };
  },
};

module.exports = PermisosService;