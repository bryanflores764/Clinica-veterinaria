// ============================================================
//  UTILS: Generador de PDF
//  Archivo: utils/pdfGenerator.js
//  Módulo: Reportes
// ============================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Asegurar que la carpeta reports existe
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Genera PDF de reporte de ventas
 * @param {Object} data - Datos del reporte
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<string>} Ruta del archivo generado
 */
const generarPDFReporteVentas = async (data, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(reportsDir, filename);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // ============================================================
      //  ENCABEZADO
      // ============================================================
      
      // Logo o título principal
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('VETCARE - Reporte de Ventas', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
      
      doc.moveDown();
      
      // Período
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text(`Período: ${data.fecha_inicio} al ${data.fecha_fin}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // ============================================================
      //  RESUMEN
      // ============================================================
      
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Resumen General', { underline: true });
      
      doc.moveDown(0.5);
      
      const resumen = data.resumen || {};
      const yResumen = doc.y;
      
      doc.fontSize(10)
        .font('Helvetica');
      
      doc.text(`💰 Total ingresos: $${(resumen.total_ingresos || 0).toFixed(2)}`, 50, yResumen);
      doc.text(`📊 Total ventas: ${resumen.total_ventas || 0}`, 250, yResumen);
      doc.text(`🎫 Ticket promedio: $${(resumen.ticket_promedio || 0).toFixed(2)}`, 450, yResumen);
      
      doc.moveDown(2);
      
      // ============================================================
      //  TABLA DE VENTAS POR DÍA
      // ============================================================
      
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Ventas por Día', { underline: true });
      
      doc.moveDown(0.5);
      
      // Cabeceras de tabla
      const startX = 50;
      let currentY = doc.y;
      
      doc.fontSize(9)
        .font('Helvetica-Bold');
      
      doc.text('Fecha', startX, currentY);
      doc.text('Ventas', startX + 100, currentY);
      doc.text('Ingresos', startX + 160, currentY);
      doc.text('Promedio', startX + 230, currentY);
      
      doc.moveDown(0.5);
      currentY = doc.y;
      
      // Línea separadora
      doc.strokeColor('#cccccc')
        .lineWidth(0.5)
        .moveTo(startX, currentY - 3)
        .lineTo(startX + 350, currentY - 3)
        .stroke();
      
      // Datos de la tabla
      doc.font('Helvetica');
      
      const ventasData = data.data || [];
      
      ventasData.forEach((item) => {
        if (doc.y > 700) {
          doc.addPage();
          currentY = doc.y;
        }
        
        doc.text(item.fecha || '-', startX, doc.y);
        doc.text(String(item.num_ventas || 0), startX + 100, doc.y);
        doc.text(`$${(item.total_ingresos || 0).toFixed(2)}`, startX + 160, doc.y);
        doc.text(`$${(item.promedio_venta || 0).toFixed(2)}`, startX + 230, doc.y);
        
        doc.moveDown(0.8);
      });
      
      doc.moveDown(1);
      
      // ============================================================
      //  TOTALES
      // ============================================================
      
      doc.fontSize(10)
        .font('Helvetica-Bold');
      
      const totalIngresos = ventasData.reduce((sum, item) => sum + (item.total_ingresos || 0), 0);
      const totalVentas = ventasData.reduce((sum, item) => sum + (item.num_ventas || 0), 0);
      
      doc.text(`TOTAL INGRESOS: $${totalIngresos.toFixed(2)}`, startX, doc.y);
      doc.text(`TOTAL VENTAS: ${totalVentas}`, startX + 200, doc.y);
      
      doc.moveDown(2);
      
      // ============================================================
      //  PIE DE PÁGINA
      // ============================================================
      
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .font('Helvetica')
          .text(
            `VetCare - Reporte generado el ${new Date().toLocaleString()} - Página ${i + 1} de ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Genera PDF de reporte de productos más vendidos
 * @param {Object} data - Datos del reporte
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<string>} Ruta del archivo generado
 */
const generarPDFProductosMasVendidos = async (data, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(reportsDir, filename);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Encabezado
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('VETCARE - Productos Más Vendidos', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
      
      doc.moveDown();
      
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text(`Período: ${data.fecha_inicio} al ${data.fecha_fin}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // Tabla de productos
      const startX = 50;
      let currentY = doc.y;
      
      doc.fontSize(9)
        .font('Helvetica-Bold');
      
      doc.text('#', startX, currentY);
      doc.text('Producto', startX + 30, currentY);
      doc.text('Categoría', startX + 200, currentY);
      doc.text('Unidades', startX + 300, currentY);
      doc.text('Ingresos', startX + 370, currentY);
      
      doc.moveDown(0.5);
      currentY = doc.y;
      
      doc.strokeColor('#cccccc')
        .lineWidth(0.5)
        .moveTo(startX, currentY - 3)
        .lineTo(startX + 500, currentY - 3)
        .stroke();
      
      doc.font('Helvetica');
      
      const productos = data.data || [];
      
      productos.forEach((item, index) => {
        if (doc.y > 700) {
          doc.addPage();
          currentY = doc.y;
        }
        
        doc.text(String(index + 1), startX, doc.y);
        doc.text(item.producto || '-', startX + 30, doc.y, { width: 160 });
        doc.text(item.categoria || '-', startX + 200, doc.y);
        doc.text(String(item.total_vendido || 0), startX + 300, doc.y);
        doc.text(`$${(item.total_ingresos || 0).toFixed(2)}`, startX + 370, doc.y);
        
        doc.moveDown(0.8);
      });
      
      doc.moveDown(1);
      
      // Totales
      doc.fontSize(10)
        .font('Helvetica-Bold');
      
      const totalUnidades = productos.reduce((sum, item) => sum + (item.total_vendido || 0), 0);
      const totalIngresos = productos.reduce((sum, item) => sum + (item.total_ingresos || 0), 0);
      
      doc.text(`TOTAL UNIDADES VENDIDAS: ${totalUnidades}`, startX, doc.y);
      doc.text(`TOTAL INGRESOS: $${totalIngresos.toFixed(2)}`, startX + 250, doc.y);
      
      // Pie de página
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .font('Helvetica')
          .text(
            `VetCare - Reporte generado el ${new Date().toLocaleString()} - Página ${i + 1} de ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Eliminar archivo PDF
 * @param {string} filePath - Ruta del archivo
 */
const eliminarPDF = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Obtener nombre de archivo para reporte
 * @param {string} tipo - Tipo de reporte
 * @returns {string} Nombre del archivo
 */
const generarNombreArchivo = (tipo) => {
  const fecha = new Date();
  const timestamp = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}_${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}${String(fecha.getSeconds()).padStart(2, '0')}`;
  return `reporte_${tipo}_${timestamp}.pdf`;
};

module.exports = {
  generarPDFReporteVentas,
  generarPDFProductosMasVendidos,
  eliminarPDF,
  generarNombreArchivo,
  reportsDir
};