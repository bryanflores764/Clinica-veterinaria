// ============================================================
//  CAPA: Repository
//  Archivo: vacunas.repository.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const connection = require('../database/connection');
const VacunasQueries = require('../models/vacunas.models');

const VacunasRepository = {

  async createVacuna(data) {
    const { mascota_id, nombre_vacuna, fecha_aplicacion, proxima_dosis, lote, observaciones, veterinario_id } = data;
    const [result] = await connection.query(VacunasQueries.CREATE_VACUNA, [
      mascota_id, nombre_vacuna, fecha_aplicacion, proxima_dosis || null, lote || null, observaciones || null, veterinario_id
    ]);
    return { id: result.insertId, ...data };
  },

  async findVacunaById(id) {
    const [rows] = await connection.query(VacunasQueries.FIND_VACUNA_BY_ID, [id]);
    return rows[0] || null;
  },

  async findVacunasByMascota(mascota_id, order_by = 'fecha_aplicacion', order = 'DESC') {
    const columnasPermitidas = ['fecha_aplicacion', 'proxima_dosis', 'nombre_vacuna', 'id', 'lote'];
    const ordenesPermitidas = ['ASC', 'DESC'];
    
    const columna = columnasPermitidas.includes(order_by) ? order_by : 'fecha_aplicacion';
    const direccion = ordenesPermitidas.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    const query = `
      SELECT v.*, u.Nombre_Usuario AS veterinario_nombre,
        CASE 
          WHEN v.proxima_dosis IS NULL THEN 'completado'
          WHEN v.proxima_dosis < CURDATE() THEN 'vencida'
          WHEN v.proxima_dosis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'proxima'
          ELSE 'aplicada'
        END AS estado_vacuna
      FROM vacunas_aplicadas v
      INNER JOIN usuarios u ON u.id = v.veterinario_id
      WHERE v.mascota_id = ? AND v.estado = 'activo'
      ORDER BY ${columna} ${direccion}
    `;
    
    const [rows] = await connection.query(query, [mascota_id]);
    return rows;
  },

  async updateVacuna(id, data) {
    const { nombre_vacuna, fecha_aplicacion, proxima_dosis, lote, observaciones } = data;
    const [result] = await connection.query(VacunasQueries.UPDATE_VACUNA, [
      nombre_vacuna, fecha_aplicacion, proxima_dosis || null, lote || null, observaciones || null, id
    ]);
    return result.affectedRows;
  },

  async deleteVacuna(id) {
    const [result] = await connection.query(VacunasQueries.DELETE_VACUNA, [id]);
    return result.affectedRows;
  },

  async findAlertasVacunas() {
    const [rows] = await connection.query(VacunasQueries.FIND_ALERTAS_VACUNAS);
    return rows;
  },

  async marcarNotificacion(vacuna_id, propietario_id) {
    const [result] = await connection.query(VacunasQueries.MARCAR_NOTIFICACION, [vacuna_id, propietario_id]);
    return result;
  },

  async checkNotificacion(vacuna_id) {
    const [rows] = await connection.query(VacunasQueries.CHECK_NOTIFICACION, [vacuna_id]);
    return rows[0] || null;
  },

  // ✅ NUEVAS FUNCIONES
  async findMascotaById(id) {
    const [rows] = await connection.execute(
      "SELECT Id, Nombre, Id_Propietario FROM mascotas WHERE Id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async findPropietarioById(id) {
    const [rows] = await connection.execute(
      "SELECT Id, Nombre, Correo, Telefono FROM propietarios WHERE Id = ?",
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = VacunasRepository;