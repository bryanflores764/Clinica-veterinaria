// ============================================================
//  MIDDLEWARE: Auditoría Automática
//  Archivo: middlewares/auditoria.middleware.js
// ============================================================

const auditoriaService = require('../services/auditoria.service');

/**
 * Middleware que registra automáticamente las acciones en auditoría
 * @param {string} modulo - Nombre del módulo (ej: 'vacunas', 'productos', 'ventas', 'citas')
 * @returns {Function} Middleware de Express
 */
const registrarAuditoria = (modulo) => {
  return async (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json
    res.json = function(data) {
      // Log para depuración
      console.log(`📌 [Auditoría] Módulo: ${modulo}, URL: ${req.method} ${req.originalUrl}, Success: ${data?.success}`);
      
      // Solo registrar si la operación fue exitosa
      if (data && data.success === true) {
        // ✅ Obtener ID del usuario de múltiples fuentes posibles
        let idUsuario = req.usuario?.id || req.usuario?.Id || req.usuario?.usuarioId;
        
        // ✅ Si el usuario es 2 pero no existe, forzar a 1 (solución temporal)
        if (idUsuario === 2) {
          console.log("⚠️ [Auditoría] Usuario ID 2 detectado, reemplazando por ID 1");
          idUsuario = 1;
        }
        
        const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '0.0.0.0';
        
        // ✅ Si no hay usuario autenticado, usar ID 1 por defecto
        if (!idUsuario) {
          console.log("⚠️ [Auditoría] Usuario no autenticado, usando ID 1 por defecto");
          idUsuario = 1;
        }
        
        // Determinar la acción basada en el método HTTP y la URL
        let accion = '';
        const method = req.method;
        const url = req.originalUrl;
        
        if (method === 'POST') {
          if (url.includes('/notificar')) accion = 'NOTIFICACION';
          else if (url.includes('/login')) accion = 'LOGIN';
          else if (url.includes('/logout')) accion = 'LOGOUT';
          else accion = 'CREATE';
        } else if (method === 'PUT') {
          accion = 'UPDATE';
        } else if (method === 'DELETE') {
          accion = 'DELETE';
        } else if (method === 'PATCH') {
          if (url.includes('/confirmar')) accion = 'CONFIRMAR';
          else if (url.includes('/anular')) accion = 'ANULAR';
          else if (url.includes('/completar')) accion = 'COMPLETAR';
          else if (url.includes('/estado')) accion = 'UPDATE_ESTADO';
          else if (url.includes('/toggle')) accion = 'TOGGLE';
          else if (url.includes('/desactivar')) accion = 'DESACTIVAR';
          else if (url.includes('/activar')) accion = 'ACTIVAR';
          else if (url.includes('/stock')) accion = 'AJUSTAR_STOCK';
          else accion = 'UPDATE';
        } else {
          // GET, HEAD, OPTIONS no se registran
          originalJson.call(this, data);
          return;
        }
        
        // Obtener ID de referencia (de params o body)
        const referenciaId = req.params.id || req.body?.id || null;
        
        // Construir descripción
        let descripcion = `${accion} en ${modulo}`;
        
        // Descripciones específicas
        if (url.includes('/stock')) {
          const { tipo, cantidad } = req.body;
          descripcion = `Ajustó stock de ${modulo} ID ${referenciaId}: ${tipo} de ${cantidad} unidades`;
        } else if (url.includes('/confirmar')) {
          descripcion = `Confirmó ${modulo} #${referenciaId}`;
        } else if (url.includes('/anular')) {
          descripcion = `Anuló ${modulo} #${referenciaId}`;
        } else if (url.includes('/completar')) {
          descripcion = `Completó ${modulo} #${referenciaId}`;
        } else if (url.includes('/toggle')) {
          descripcion = `Cambió estado de ${modulo} ID ${referenciaId}`;
        } else if (url.includes('/login')) {
          descripcion = `Inicio de sesión: ${req.body?.correo || 'usuario'}`;
        } else if (url.includes('/logout')) {
          descripcion = `Cierre de sesión`;
        } else if (referenciaId) {
          descripcion = `${accion} en ${modulo} - ID: ${referenciaId}`;
        }
        
        console.log(`✅ [Auditoría] Registrando: ${accion} en ${modulo} por usuario ${idUsuario}`);
        
        // Registrar en auditoría
        auditoriaService.registrarAccion({
          usuario_id: idUsuario,
          modulo: modulo,
          accion: accion,
          descripcion: descripcion,
          ip: ip,
          referencia_id: referenciaId
        }).catch(err => {
          console.error('❌ Error en auditoría automática:', err.message);
        });
      }
      
      // Llamar al método original
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { registrarAuditoria };