// ============================================================
//  UTILS: Envío de correos reales (Diseño VetCare Profesional)
//  Archivo: utils/emailSender.js
//  MODIFICADO: Mejora visual de productos y servicios
// ============================================================

const nodemailer = require('nodemailer');

const EMAIL_USER = 'vetcareclinica7@gmail.com';
const EMAIL_PASS = 'ddrx xlhw mcqe xouh';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ── Enviar factura por correo (INCLUYE PRODUCTOS Y SERVICIOS MEJORADO) ──
const enviarFacturaPorCorreo = async (correoDestino, facturaData) => {
  try {
    const fechaEmision = facturaData.fechaEmision
      ? new Date(facturaData.fechaEmision).toLocaleString('es-ES', {
          day: 'numeric', month: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        })
      : new Date().toLocaleString('es-ES');

    const getMetodoPagoTexto = (metodo) => {
      const metodos = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia'
      };
      return metodos[metodo?.toLowerCase()] || metodo || 'No especificado';
    };

    // ── TABLA DE PRODUCTOS ──────────────────────────────────────
    const productos = facturaData.productos || [];
    const tieneProductos = productos.length > 0;
    
    const tablaProductos = tieneProductos ? `
      <p style="margin:20px 0 10px 0;font-size:14px;font-weight:bold;color:#1e293b;font-family:Arial,sans-serif;">📦 Productos</p>
      <table class="prod-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Producto</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Cant.</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">P. Unit.</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productos.map(p => `
            <tr>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">${p.nombre}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#475569;text-align:center;font-family:Arial,sans-serif;">${p.cantidad}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#475569;text-align:right;font-family:Arial,sans-serif;">$${(p.precio_unitario ?? (p.subtotal / p.cantidad)).toFixed(2)}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#0071BC;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${p.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    // ── TABLA DE SERVICIOS ──────────────────────────────────────
    const servicios = facturaData.servicios || [];
    const tieneServicios = servicios.length > 0;
    
    const tablaServicios = tieneServicios ? `
      <p style="margin:20px 0 10px 0;font-size:14px;font-weight:bold;color:#1e293b;font-family:Arial,sans-serif;">💊 Servicios</p>
      <table class="prod-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Servicio</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Cant.</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">P. Unit.</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:bold;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;border-bottom:2px solid #e2e8f0;font-family:Arial,sans-serif;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${servicios.map(s => `
            <tr>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#1e293b;font-family:Arial,sans-serif;">${s.nombre}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#475569;text-align:center;font-family:Arial,sans-serif;">${s.cantidad}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#475569;text-align:right;font-family:Arial,sans-serif;">$${(s.precio_unitario ?? (s.subtotal / s.cantidad)).toFixed(2)}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #e8ecf0;font-size:13px;color:#0071BC;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${s.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    // Mensaje cuando no hay nada
    const noItemsMsg = (!tieneProductos && !tieneServicios) ? `
      <p style="text-align:center;padding:20px;color:#94a3b8;font-family:Arial,sans-serif;">
        No hay productos ni servicios registrados en esta venta.
      </p>
    ` : '';

    // ── SECCIÓN DE PAGO ─────────────────────────────────────────
    const filaPago = facturaData.metodoPago ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border-radius:10px;margin-top:20px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 10px 0;font-size:11px;font-weight:bold;color:#166534;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif;">Informacion de pago</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">Metodo:</td>
                <td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">${getMetodoPagoTexto(facturaData.metodoPago)}</td>
              </tr>
              ${facturaData.metodoPago === 'efectivo' ? `
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">Recibido:</td>
                <td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${facturaData.montoRecibido?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">Cambio:</td>
                <td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${facturaData.cambio?.toFixed(2) || '0.00'}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">Total pagado:</td>
                <td style="padding:4px 0;font-size:14px;color:#0071BC;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">$${facturaData.total?.toFixed(2) || '0.00'}</td>
              </tr>
            </table>
           </td>
         </tr>
       </table>
    ` : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Factura VetCare</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f0f2f5; }
    @media only screen and (max-width: 600px) {
      .wrapper { width: 100% !important; padding: 12px !important; }
      .container { border-radius: 14px !important; }
      .header-cell { padding: 24px 20px !important; }
      .header-title { font-size: 24px !important; }
      .content-cell { padding: 24px 16px !important; }
      .footer-cell { padding: 16px !important; }
      .info-table td { font-size: 12px !important; }
      .total-amount { font-size: 22px !important; }
      .prod-table th, .prod-table td { padding: 8px 4px !important; font-size: 11px !important; }
      .carta td { font-size: 13px !important; padding: 16px 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;">

  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;padding:24px 16px;">
    <tr>
      <td align="center">

        <table class="container" width="560" cellpadding="0" cellspacing="0" border="0"
          style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td class="header-cell" align="center" style="background-color:#0071BC;padding:32px 28px;">
              <p class="header-title" style="margin:0 0 4px 0;font-size:28px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">VetCare</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;">Comprobante de Venta Electronico</p>
             </td>
           </tr>

          <!-- BODY -->
          <tr>
            <td class="content-cell" style="padding:28px 24px;">

              <!-- Carta formal -->
              <table class="carta" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f8fafc;border-left:4px solid #0071BC;border-radius:0 10px 10px 0;padding:18px 20px;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">
                    <p style="margin:0 0 10px 0;">Estimado(a) <strong style="color:#0f172a;">${facturaData.cliente}</strong>:</p>
                    <p style="margin:0 0 10px 0;">Gracias por confiar en nosotros. Adjuntamos la factura correspondiente a su compra para su referencia y control.</p>
                    <p style="margin:0 0 10px 0;">En el documento encontrara el detalle completo de los productos o servicios adquiridos, asi como la informacion fiscal correspondiente.</p>
                    <p style="margin:0 0 10px 0;">Si tiene alguna consulta, estaremos encantados de atenderle.</p>
                    <p style="margin:0;">Atentamente,<br>
                      <strong style="color:#0071BC;">VetCare Clinica Veterinaria</strong><br>
                      <span style="color:#6b7280;font-size:12px;">${EMAIL_USER}</span>
                    </p>
                   </td>
                 </tr>
               </table>

              <!-- Info de factura -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 14px 0;font-size:14px;font-weight:bold;color:#1e293b;border-left:4px solid #0071BC;padding-left:10px;font-family:Arial,sans-serif;">Informacion de la factura</p>
                    <table class="info-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">N° de control</td>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-family:Arial,sans-serif;">#${facturaData.numeroFactura}</td>
                       </tr>
                      ${facturaData.codigoGeneracion ? `
                      <tr>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">Codigo generacion</td>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;word-break:break-all;font-family:Arial,sans-serif;">${facturaData.codigoGeneracion}</td>
                       </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">Fecha de emision</td>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-family:Arial,sans-serif;">${fechaEmision}</td>
                       </tr>
                      <tr>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">Cliente</td>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-family:Arial,sans-serif;">${facturaData.cliente}</td>
                       </tr>
                      ${facturaData.correoCliente || correoDestino ? `
                      <tr>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">Correo</td>
                        <td style="padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;word-break:break-all;font-family:Arial,sans-serif;">${facturaData.correoCliente || correoDestino}</td>
                       </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:7px 0;font-size:13px;font-weight:bold;color:#475569;font-family:Arial,sans-serif;">Estado</td>
                        <td style="padding:7px 0;text-align:right;font-family:Arial,sans-serif;">
                          <span style="display:inline-block;padding:3px 10px;background:#dcfce7;color:#166534;border-radius:20px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif;">Confirmada</span>
                        </td>
                       </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PRODUCTOS Y SERVICIOS -->
              ${tablaProductos}
              ${tablaServicios}
              ${noItemsMsg}

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border-radius:12px;margin:20px 0;">
                <tr>
                  <td style="padding:16px 20px;text-align:right;">
                    <p style="margin:0 0 4px 0;font-size:11px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif;">Total a pagar</p>
                    <p class="total-amount" style="margin:0;font-size:26px;font-weight:bold;color:#0071BC;font-family:Arial,sans-serif;">$${facturaData.total?.toFixed(2) || '0.00'}</p>
                  </td>
                </tr>
              </table>

              <!-- Pago -->
              ${filaPago}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-cell" align="center" style="background:#f8f9fa;padding:18px 24px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px 0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">Este comprobante es de caracter informativo.</p>
              <p style="margin:0 0 4px 0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">VetCare — Cuidando a quien mas amas</p>
              <p style="margin:0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
            </td>
          </tr>

        </table>
        <!-- /Container -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"VetCare" <${EMAIL_USER}>`,
      to: correoDestino,
      subject: `Factura VetCare #${facturaData.numeroFactura} — Confirmada`,
      html: htmlContent
    });

    return { success: true, message: `Factura enviada a ${correoDestino}` };

  } catch (error) {
    console.error("Error al enviar factura:", error);
    return { success: false, message: error.message, error: error.message };
  }
};

// ── Enviar notificación de vacuna ─────────────────────────────────────────────
const enviarNotificacionVacuna = async (destino, vacunaData) => {
  const mascota = vacunaData.mascotaNombre || vacunaData.mascota || 'la mascota';
  const vacuna = vacunaData.vacunaNombre || vacunaData.vacuna || 'la vacuna';
  const proximaDosis = vacunaData.proximaDosis;
  const diasRestantes = vacunaData.diasRestantes;
  const propietario = vacunaData.propietarioNombre || vacunaData.propietario || null;

  const esUrgente = diasRestantes <= 7;
  const esModerado = diasRestantes > 7 && diasRestantes <= 15;

  const alertaBgColor = esUrgente ? '#fef2f2' : esModerado ? '#fff7ed' : '#fffbeb';
  const alertaBoColor = esUrgente ? '#fecaca' : esModerado ? '#fed7aa' : '#fde68a';
  const alertaTxColor = esUrgente ? '#991b1b' : esModerado ? '#9a3412' : '#92400e';
  const alertaMensaje = esUrgente
    ? 'Atencion: La vacuna vence en menos de una semana'
    : esModerado
    ? 'La vacuna esta proxima a vencer'
    : 'Recordatorio: Vacuna proxima a su fecha de aplicacion';

  const diasBgColor = esUrgente ? '#fef2f2' : esModerado ? '#fff7ed' : '#eff6ff';
  const diasTxColor = esUrgente ? '#dc2626' : esModerado ? '#ea580c' : '#1d4ed8';
  const diasBoColor = esUrgente ? '#fecaca' : esModerado ? '#fed7aa' : '#bfdbfe';

  const fechaDosis = proximaDosis
    ? new Date(proximaDosis).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'No especificada';

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Recordatorio de Vacuna — VetCare</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f0f2f5; }
    @media only screen and (max-width: 600px) {
      .wrapper { padding: 12px !important; }
      .container { border-radius: 14px !important; }
      .header-cell { padding: 24px 20px !important; }
      .header-title { font-size: 24px !important; }
      .content-cell { padding: 24px 16px !important; }
      .carta-cell { font-size: 13px !important; padding: 16px 14px !important; }
      .dato-table td { font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;">

  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;padding:24px 16px;">
    <tr>
      <td align="center">

        <table class="container" width="520" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td class="header-cell" align="center" style="background-color:#0071BC;padding:32px 28px;">
              <p class="header-title" style="margin:0 0 4px 0;font-size:28px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">VetCare</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;">Recordatorio de Vacunacion</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="content-cell" style="padding:28px 24px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td class="carta-cell" style="background:#f8fafc;border-left:4px solid #0071BC;border-radius:0 10px 10px 0;padding:18px 20px;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">
                    <p style="margin:0 0 10px 0;">Estimado(a) <strong style="color:#0f172a;">${propietario || 'propietario(a)'}</strong>:</p>
                    <p style="margin:0 0 10px 0;">Reciba un cordial saludo.</p>
                    <p style="margin:0 0 10px 0;">Le recordamos que su mascota <strong style="color:#0071BC;">${mascota}</strong> tiene programada o proxima a vencer una vacuna importante para mantener su salud y bienestar.</p>
                    <p style="margin:0 0 10px 0;">Le recomendamos ponerse en contacto con nosotros para agendar su cita y asegurar que su mascota continue protegida de acuerdo con su calendario de vacunacion.</p>
                    <p style="margin:0 0 10px 0;">Gracias por confiar en nosotros para el cuidado de su mascota.</p>
                    <p style="margin:0;">Atentamente,<br>
                      <strong style="color:#0071BC;">VetCare Clinica Veterinaria</strong><br>
                      <span style="color:#6b7280;font-size:12px;">${EMAIL_USER}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center" style="background-color:${alertaBgColor};border:1px solid ${alertaBoColor};border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;font-weight:bold;color:${alertaTxColor};font-family:Arial,sans-serif;">${alertaMensaje}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 14px 0;font-size:14px;font-weight:bold;color:#1e293b;border-left:4px solid #0071BC;padding-left:10px;font-family:Arial,sans-serif;">Informacion de la mascota</p>
                    <table class="dato-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#64748b;font-family:Arial,sans-serif;">Mascota</td>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">${mascota}</td>
                       </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#64748b;font-family:Arial,sans-serif;">Vacuna pendiente</td>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">${vacuna}</td>
                       </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:bold;color:#64748b;font-family:Arial,sans-serif;">Proxima dosis</td>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">${fechaDosis}</td>
                       </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;font-weight:bold;color:#64748b;font-family:Arial,sans-serif;">Dias restantes</td>
                        <td style="padding:8px 0;text-align:right;font-family:Arial,sans-serif;">
                          <span style="display:inline-block;background:${diasBgColor};color:${diasTxColor};border:1px solid ${diasBoColor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif;">${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}</span>
                        </td>
                       </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background:#f8f9fa;padding:18px 24px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px 0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">Este es un correo automatico, por favor no responder.</p>
              <p style="margin:0 0 4px 0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">VetCare — Cuidando a quien mas amas</p>
              <p style="margin:0;font-size:11px;color:#94a3b8;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"VetCare" <${EMAIL_USER}>`,
      to: destino,
      subject: `Recordatorio de vacunacion — ${mascota} (${diasRestantes} dias restantes)`,
      html: htmlContent
    });
    return { success: true, message: "Notificación enviada" };
  } catch (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
};

module.exports = {
  enviarFacturaPorCorreo,
  enviarNotificacionVacuna
};