// ============================================================
//  MIDDLEWARE: Notificaciones Automáticas
//  Archivo: middlewares/notificacionVacuna.middleware.js
// ============================================================

const emailSender = require('../utils/emailSender');

/**
 * Middleware que envía notificaciones automáticas por correo
 */
const enviarNotificacion = (tipo) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function(data) {
      if (data && data.success === true) {
        try {
          if (tipo === 'vacuna') {
            const vacunaId = req.params.id;
            console.log(`📧 [Notificación] Enviando alerta de vacuna ID: ${vacunaId}`);
          }
          if (tipo === 'factura') {
            console.log(`📧 [Notificación] Enviando factura para venta ID: ${req.params.id}`);
          }
        } catch (error) {
          console.error('❌ Error en notificación:', error.message);
        }
      }
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
  const {
    propietarioCorreo,
    propietarioNombre,  // ← nombre del propietario para el saludo
    mascotaNombre,
    vacunaNombre,
    proximaDosis,
    diasRestantes
  } = datos;

  if (!propietarioCorreo) {
    console.log('⚠️ No hay correo destino para la notificación');
    return { success: false, message: 'No hay correo destino' };
  }

  const resultado = await emailSender.enviarNotificacionVacuna(propietarioCorreo, {
    propietarioNombre,  // ← se pasa al emailSender para que aparezca en la carta
    mascotaNombre,
    vacunaNombre,
    proximaDosis,
    diasRestantes
  });

  return resultado;
};

module.exports = {
  enviarNotificacion,
  enviarNotificacionVacuna
};