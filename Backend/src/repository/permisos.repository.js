// ============================================================
//  CAPA: Repository
//  Archivo: permisos.repository.js
//
//  Responsabilidad:
//    • Única capa que habla con la base de datos.
//    • Usa las queries del Model y la conexión del módulo database.
//    • Devuelve datos crudos (filas de MySQL); no lanza errores de negocio.
// ============================================================

const connection = require('../database/connection');
const PermisosQueries = require('../models/permisos.model');

const PermisosRepository = {
  /**
   * Inserta o actualiza un permiso (INSERT … ON DUPLICATE KEY UPDATE).
   * @param {object} permiso - { RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar }
   * @returns {object} ResultSetHeader de mysql2
   */
  async upsert(permiso) {
    const { RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar } = permiso;

    const [result] = await connection.execute(PermisosQueries.UPSERT, [
      RolId,
      Modulo,
      Puede_Crear    ? 1 : 0,
      Puede_Leer     ? 1 : 0,
      Puede_Editar   ? 1 : 0,
      Puede_Eliminar ? 1 : 0,
    ]);

    return result;
  },

  /**
   * Busca el permiso de un rol sobre un módulo.
   * @param {number} rolId
   * @param {string} modulo
   * @returns {object|null} fila o null si no existe
   */
  async findByRolAndModulo(rolId, modulo) {
    const [rows] = await connection.execute(
      PermisosQueries.FIND_BY_ROL_AND_MODULO,
      [rolId, modulo]
    );

    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Devuelve todos los permisos de un rol.
   * @param {number} rolId
   * @returns {Array}
   */
  async findAllByRol(rolId) {
    const [rows] = await connection.execute(
      PermisosQueries.FIND_ALL_BY_ROL,
      [rolId]
    );

    return rows;
  },

  /**
   * Devuelve todos los permisos registrados (con nombre de rol).
   * @returns {Array}
   */
  async findAll() {
    const [rows] = await connection.execute(PermisosQueries.FIND_ALL);
    return rows;
  },

  /**
   * Elimina el permiso de un rol sobre un módulo.
   * @param {number} rolId
   * @param {string} modulo
   * @returns {object} ResultSetHeader
   */
  async deleteByRolAndModulo(rolId, modulo) {
    const [result] = await connection.execute(
      PermisosQueries.DELETE_BY_ROL_AND_MODULO,
      [rolId, modulo]
    );

    return result;
  },
};

module.exports = PermisosRepository;