// ============================================================
//  MIDDLEWARE: Notificaciones Automáticas
//  Archivo: middlewares/notificaciones.middleware.js
// ============================================================

const emailSender = require('../utils/emailSender');

/**
 * Middleware que envía notificaciones automáticas por correo
 * @param {string} tipo - Tipo de notificación: 'vacuna', 'factura', 'recordatorio'
 * @returns {Function} Middleware de Express
 */
const enviarNotificacion = (tipo) => {
  return async (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json
    res.json = async function(data) {
      // Solo enviar notificación si la operación fue exitosa
      if (data && data.success === true) {
        const idUsuario = req.usuario?.id || req.usuario?.Id;
        
        try {
          if (tipo === 'vacuna') {
            // Obtener datos de la vacuna desde la respuesta o request
            const vacunaId = req.params.id;
            
            // Aquí puedes obtener los datos necesarios de la vacuna
            console.log(`📧 [Notificación] Enviando alerta de vacuna ID: ${vacunaId}`);
            
            // Ejemplo: enviar notificación de vacuna
            // const resultado = await emailSender.enviarNotificacionVacuna(destino, datos);
          }
          
          if (tipo === 'factura') {
            console.log(`📧 [Notificación] Enviando factura para venta ID: ${req.params.id}`);
          }
          
        } catch (error) {
          console.error('❌ Error en notificación:', error.message);
        }
      }
      
      // Llamar al método original
      originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Función directa para enviar notificación de vacuna
 * @param {Object} datos - Datos de la vacuna y propietario
 */
const enviarNotificacionVacuna = async (datos) => {
  const { propietarioCorreo, mascotaNombre, vacunaNombre, proximaDosis, diasRestantes } = datos;
  
  if (!propietarioCorreo) {
    console.log('⚠️ No hay correo destino para la notificación');
    return { success: false, message: 'No hay correo destino' };
  }
  
  const resultado = await emailSender.enviarNotificacionVacuna(propietarioCorreo, {
    mascota: mascotaNombre,
    vacuna: vacunaNombre,
    proximaDosis: proximaDosis,
    diasRestantes: diasRestantes
  });
  
  return resultado;
};

module.exports = { 
  enviarNotificacion,
  enviarNotificacionVacuna
};