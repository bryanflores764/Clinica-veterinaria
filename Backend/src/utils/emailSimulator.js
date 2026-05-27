// ============================================================
//  UTILS: Simulador de envío de correos
//  Archivo: utils/emailSimulator.js
// ============================================================

/**
 * Simula el envío de una factura por correo
 * @param {string} correoDestino - Correo del cliente
 * @param {Object} facturaData - Datos de la factura
 * @returns {Promise<Object>} Resultado del envío
 */
const enviarFacturaPorCorreo = async (correoDestino, facturaData) => {
  console.log(`📧 [SIMULACIÓN] Enviando factura a: ${correoDestino}`);
  console.log(`📧 [SIMULACIÓN] Datos de factura:`, facturaData);
  
  // Simular tiempo de envío
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simular éxito (95% de éxito)
  const exito = Math.random() > 0.05;
  
  if (exito) {
    console.log(`✅ [SIMULACIÓN] Factura enviada exitosamente a ${correoDestino}`);
    return {
      success: true,
      message: `Factura enviada a ${correoDestino}`,
      fechaEnvio: new Date()
    };
  } else {
    console.log(`❌ [SIMULACIÓN] Error al enviar factura a ${correoDestino}`);
    return {
      success: false,
      message: `Error al enviar a ${correoDestino}`,
      error: "Error de conexión con el servidor de correo"
    };
  }
};

/**
 * Genera un número de control único para la factura
 * @returns {string} Número de control
 */
const generarNumeroControl = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${anio}${mes}${dia}-${aleatorio}`;
};

/**
 * Genera un código de generación único
 * @returns {string} Código de generación
 */
const generarCodigoGeneracion = () => {
  return `CG-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

module.exports = {
  enviarFacturaPorCorreo,
  generarNumeroControl,
  generarCodigoGeneracion
};