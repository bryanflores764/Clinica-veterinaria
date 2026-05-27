// ============================================================
//  UTILS: Envío de correos reales (RESPONSIVE - Simplificado)
//  Archivo: utils/emailSender.js
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

const enviarFacturaPorCorreo = async (destino, facturaData) => {
  const {
    numeroFactura,
    fechaEmision,
    total,
    cliente,
    productos
  } = facturaData;

  // Generar filas de productos
  let productosRowsTabla = '';
  let productosCards = '';

  if (productos && productos.length > 0) {
    productosRowsTabla = productos.map(p => `
      <tr>
        <td style="padding:12px 14px; text-align:left; font-size:13px; color:#334155; border-bottom:1px solid #e2e8f0;">${p.nombre || 'Producto'}</td>
        <td style="padding:12px 14px; text-align:center; font-size:13px; color:#334155; border-bottom:1px solid #e2e8f0;">${p.cantidad || 0}</td>
        <td style="padding:12px 14px; text-align:right; font-size:13px; color:#334155; border-bottom:1px solid #e2e8f0;">$${(p.precio_unitario || 0).toFixed(2)}</td>
        <td style="padding:12px 14px; text-align:right; font-size:13px; color:#334155; border-bottom:1px solid #e2e8f0;">$${(p.subtotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    productosCards = productos.map(p => `
      <div style="background:#f8fafc; border-radius:10px; padding:12px 14px; margin-bottom:10px; border-left:4px solid #1a5d8f;">
        <p style="margin:0 0 6px 0; font-size:14px; font-weight:700; color:#1e293b;">${p.nombre || 'Producto'}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:12px; color:#64748b; padding:2px 0;">Cantidad:</td>
            <td style="font-size:12px; color:#334155; font-weight:600; text-align:right; padding:2px 0;">${p.cantidad || 0}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#64748b; padding:2px 0;">Precio unitario:</td>
            <td style="font-size:12px; color:#334155; font-weight:600; text-align:right; padding:2px 0;">$${(p.precio_unitario || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#64748b; padding:2px 0;">Subtotal:</td>
            <td style="font-size:13px; color:#42AB49; font-weight:800; text-align:right; padding:2px 0;">$${(p.subtotal || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `).join('');
  } else {
    productosRowsTabla = `
      <tr>
        <td colspan="4" style="padding:20px; text-align:center; color:#999; font-size:13px;">No hay productos registrados</td>
      </tr>
    `;
    productosCards = `<p style="text-align:center; color:#999; font-size:13px; padding:20px 0;">No hay productos registrados</p>`;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura VetCare</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body, html { margin:0; padding:0; width:100% !important; background-color:#f4f8f7; }
    .email-wrapper { width:100% !important; }
    .email-container { width:100% !important; max-width:620px !important; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .desktop-table { display:table !important; }
    .mobile-cards { display:none !important; }
    
    @media screen and (max-width: 600px) {
      body { padding: 8px !important; }
      .header-cell { padding: 20px 16px !important; }
      .header-title { font-size: 20px !important; }
      .content-cell { padding: 16px !important; }
      .desktop-table { display: none !important; }
      .mobile-cards { display: block !important; }
      .total-amount { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:20px; font-family:'Segoe UI',Arial,sans-serif; background-color:#f4f8f7;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:0;">
        <table class="email-container" width="620" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="header-cell" style="background-color:#1a5d8f; padding:28px 24px; text-align:center;">
              <p class="header-title" style="color:#ffffff; font-size:26px; font-weight:700; margin:0;">🐾 VetCare</p>
              <p style="color:rgba(255,255,255,0.82); font-size:14px; margin:6px 0 0;">Clínica Veterinaria</p>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:28px 24px;">
              <table width="100%" style="margin-bottom:22px;">
                <tr>
                  <td style="background-color:#e8f5e9; padding:14px 16px; border-radius:12px; text-align:center;">
                    <p style="margin:0; color:#2e7d32; font-size:14px; font-weight:600;">🐾 ¡Gracias por confiar en nosotros!</p>
                  </td>
                </tr>
              </table>
              <table width="100%" style="background-color:#f8fafc; border-radius:12px; padding:16px; margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right:12px;">
                          <p style="margin:0 0 8px 0;"><span style="font-size:12px; color:#64748b; display:block;">Cliente</span><span style="font-size:14px; font-weight:700; color:#1e293b;">${cliente || 'Cliente'}</span></p>
                        </td>
                        <td width="50%" valign="top" style="padding-left:12px;">
                          <p style="margin:0 0 8px 0;"><span style="font-size:12px; color:#64748b; display:block;">N° Factura</span><span style="font-size:14px; font-weight:700; color:#1a5d8f;">#${numeroFactura}</span></p>
                          <p style="margin:0;"><span style="font-size:12px; color:#64748b; display:block;">Fecha Emisión</span><span style="font-size:13px; font-weight:600; color:#1e293b;">${new Date(fechaEmision).toLocaleString()}</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="font-size:15px; font-weight:700; color:#1e293b; margin-bottom:14px;">🛒 Detalle de compra</p>
              <div class="desktop-table" style="width:100%; overflow-x:auto; margin-bottom:20px;">
                <table width="100%" style="border-collapse:collapse; border-radius:12px; overflow:hidden;">
                  <thead><tr style="background-color:#1a5d8f;"><th style="padding:12px 14px; text-align:left; color:#fff;">Producto</th><th style="padding:12px 14px; text-align:center; color:#fff;">Cant.</th><th style="padding:12px 14px; text-align:right; color:#fff;">Precio Unit.</th><th style="padding:12px 14px; text-align:right; color:#fff;">Subtotal</th></tr></thead>
                  <tbody>${productosRowsTabla}</tbody>
                </table>
              </div>
              <div class="mobile-cards" style="display:none; margin-bottom:20px;">${productosCards}</div>
              <table width="100%" style="background:linear-gradient(135deg,#1a5d8f,#1e7abf); border-radius:12px; padding:18px 20px; margin-bottom:22px;">
                <tr><td style="color:rgba(255,255,255,0.85); font-size:13px; font-weight:600;">TOTAL A PAGAR</td><td class="total-amount" style="color:#ffffff; font-size:24px; font-weight:800; text-align:right;">$${(total || 0).toFixed(2)}</td></tr>
              </table>
              <table width="100%"><tr><td style="border-top:1px solid #e2e8f0; padding-top:16px; text-align:center;"><p style="margin:0; color:#64748b; font-size:12px;">✨ Esta factura es un comprobante válido de tu compra. ✨</p></td></tr></table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f1f5f9; padding:16px 24px; text-align:center;">
              <p style="margin:0; color:#94a3b8; font-size:11px;">© 2026 VetCare Clínica Veterinaria. Todos los derechos reservados.</p>
              <p style="margin:6px 0 0; color:#94a3b8; font-size:11px;">Este es un correo automático, por favor no responder.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"VetCare" <${EMAIL_USER}>`,
    to: destino,
    subject: `🧾 Factura Electrónica #${numeroFactura} - VetCare`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${destino}`);
    return { success: true, message: `Factura enviada a ${destino}` };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, message: `Error: ${error.message}` };
  }
};

module.exports = { enviarFacturaPorCorreo };