const API_REPORTES_VENTAS = 'http://localhost:3000/api/reportes/ventas';
const API_PRODUCTOS_MAS_VENDIDOS = 'http://localhost:3000/api/reportes/productos-mas-vendidos';

const tablaReportesVentas = document.getElementById('tablaReportesVentas');
const tablaProductosMasVendidos = document.getElementById('tablaProductosMasVendidos');

const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');
const btnBuscarReporte = document.getElementById('btnBuscarReporte');
const btnLimpiarReporte = document.getElementById('btnLimpiarReporte');
const btnExportarPDF = document.getElementById('btnExportarPDF');

const totalIngresos = document.getElementById('totalIngresos');
const totalVentas = document.getElementById('totalVentas');
const totalProductos = document.getElementById('totalProductos');

function obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toISOString().split('T')[0];
}

function obtenerPrimerDiaMes() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    return `${anio}-${mes}-01`;
}

function cargarFechasPorDefecto() {
    if (!fechaInicio.value) {
        fechaInicio.value = obtenerPrimerDiaMes();
    }

    if (!fechaFin.value) {
        fechaFin.value = obtenerFechaActual();
    }
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';

    const fechaCorta = String(fecha).split('T')[0];
    const partes = fechaCorta.split('-');

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearDinero(valor) {
    const numero = Number(valor) || 0;
    return `$${numero.toFixed(2)}`;
}

/* =========================
   TOAST
========================= */

function mostrarToastReporte(mensaje, esError = false) {
    const container = document.getElementById('toast-container-reportes');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast-reporte');
    if (esError) toast.classList.add('error');
    toast.textContent = mensaje;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/* =========================
   EXPORTAR PDF
========================= */

function leerFilasTabla(tbodyId, colSpan) {
    const filas = [];
    document.querySelectorAll(`#${tbodyId} tr`).forEach((tr) => {
        const celdas = [...tr.querySelectorAll('td')];
        if (celdas.length > 0 && !celdas[0].classList.contains('sin-datos')) {
            filas.push(celdas.map((td) => td.textContent.trim()));
        }
    });
    return filas;
}

function exportarPDF() {
    if (!window.jspdf) {
        mostrarToastReporte('La librería de PDF no está disponible. Recarga la página.', true);
        return;
    }

    const inicio = fechaInicio.value || obtenerPrimerDiaMes();
    const fin = fechaFin.value || obtenerFechaActual();
    const ahora = new Date();
    const generadoEn = ahora.toLocaleDateString('es-SV') + ' ' + ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const VERDE = [47, 168, 79];
    const NEGRO = [30, 30, 30];
    const GRIS = [100, 100, 100];
    const VERDE_CLARO = [237, 255, 240];

    // --- Encabezado ---
    doc.setFontSize(22);
    doc.setTextColor(...VERDE);
    doc.setFont(undefined, 'bold');
    doc.text('VetCare', 14, 20);

    doc.setFontSize(15);
    doc.setTextColor(...NEGRO);
    doc.text('Reporte de Ventas', 14, 29);

    doc.setFontSize(10);
    doc.setTextColor(...GRIS);
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${formatearFecha(inicio)} al ${formatearFecha(fin)}`, 14, 37);
    doc.text(`Generado: ${generadoEn}`, 14, 43);

    // Línea separadora
    doc.setDrawColor(220);
    doc.line(14, 47, 283, 47);

    // --- Resumen ---
    doc.setFontSize(11);
    doc.setTextColor(...NEGRO);
    doc.setFont(undefined, 'bold');
    doc.text('Resumen', 14, 56);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const resumen = [
        { label: 'Total ingresos', valor: totalIngresos.textContent },
        { label: 'Ventas realizadas', valor: totalVentas.textContent },
        { label: 'Ventas anuladas', valor: totalProductos.textContent },
    ];

    resumen.forEach((item, i) => {
        const x = 14 + i * 92;
        doc.setTextColor(...GRIS);
        doc.text(item.label, x, 63);
        doc.setFontSize(13);
        doc.setTextColor(...NEGRO);
        doc.setFont(undefined, 'bold');
        doc.text(item.valor, x, 70);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
    });

    // --- Tabla detalle del reporte ---
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...NEGRO);
    doc.text('Detalle del reporte', 14, 82);

    const filasReporte = leerFilasTabla('tablaReportesVentas');
    doc.autoTable({
        startY: 86,
        head: [['Fecha', 'Ventas', 'Total ingresos', 'Promedio venta', 'Confirmadas', 'Anuladas']],
        body: filasReporte.length > 0 ? filasReporte : [['Sin datos para el período seleccionado', '', '', '', '', '']],
        headStyles: { fillColor: VERDE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 10, textColor: NEGRO },
        alternateRowStyles: { fillColor: VERDE_CLARO },
        styles: { cellPadding: 4 },
    });

    // --- Tabla productos más vendidos ---
    const y2 = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...NEGRO);
    doc.text('Productos más vendidos', 14, y2);

    const filasProductos = leerFilasTabla('tablaProductosMasVendidos');
    doc.autoTable({
        startY: y2 + 4,
        head: [['Producto', 'Cantidad vendida', 'Total generado']],
        body: filasProductos.length > 0 ? filasProductos : [['Sin datos para el período seleccionado', '', '']],
        headStyles: { fillColor: VERDE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 10, textColor: NEGRO },
        alternateRowStyles: { fillColor: VERDE_CLARO },
        styles: { cellPadding: 4 },
    });

    // --- Pie de página ---
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...GRIS);
        doc.text(
            `Pág. ${i} de ${totalPaginas} — VetCare`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
        );
    }

    doc.save(`reporte_ventas_${inicio}_al_${fin}.pdf`);
    mostrarToastReporte('PDF exportado y descargado correctamente.');
}

/* =========================
   REPORTES DE VENTAS
========================= */

function mostrarCargaReportes() {
    tablaReportesVentas.innerHTML = `
        <tr>
            <td colspan="6" class="sin-datos">
                Cargando reportes de ventas...
            </td>
        </tr>
    `;
}

function mostrarMensajeReportes(mensaje) {
    tablaReportesVentas.innerHTML = `
        <tr>
            <td colspan="6" class="sin-datos">
                ${mensaje}
            </td>
        </tr>
    `;

    totalIngresos.textContent = '$0.00';
    totalVentas.textContent = '0';
    totalProductos.textContent = '0';
}

function normalizarReporte(reporte) {
    return {
        fecha: reporte.fecha || '',
        numVentas: Number(reporte.num_ventas || 0),
        totalIngresos: Number(reporte.total_ingresos || 0),
        promedioVenta: Number(reporte.promedio_venta || 0),
        confirmadas: Number(reporte.confirmadas || 0),
        anuladas: Number(reporte.anuladas || 0)
    };
}

function obtenerReportesDesdeRespuesta(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}

function renderizarReportes(reportes) {
    tablaReportesVentas.innerHTML = '';

    if (!reportes || reportes.length === 0) {
        tablaReportesVentas.innerHTML = `
            <tr>
                <td colspan="6" class="sin-datos">
                    No hay ventas registradas para el rango de fechas seleccionado.
                </td>
            </tr>
        `;
        return;
    }

    reportes.forEach((reporte) => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${formatearFecha(reporte.fecha)}</td>
            <td>${reporte.numVentas}</td>
            <td>${formatearDinero(reporte.totalIngresos)}</td>
            <td>${formatearDinero(reporte.promedioVenta)}</td>
            <td>${reporte.confirmadas}</td>
            <td>${reporte.anuladas}</td>
        `;

        tablaReportesVentas.appendChild(fila);
    });
}

function actualizarResumen(resumen, reportes) {
    if (resumen) {
        totalIngresos.textContent = formatearDinero(resumen.total_ingresos || 0);
        totalVentas.textContent = resumen.total_ventas || 0;
        totalProductos.textContent = resumen.ventas_anuladas || 0;
        return;
    }

    const ingresos = reportes.reduce((total, reporte) => {
        return total + Number(reporte.totalIngresos || 0);
    }, 0);

    const ventas = reportes.reduce((total, reporte) => {
        return total + Number(reporte.numVentas || 0);
    }, 0);

    const anuladas = reportes.reduce((total, reporte) => {
        return total + Number(reporte.anuladas || 0);
    }, 0);

    totalIngresos.textContent = formatearDinero(ingresos);
    totalVentas.textContent = ventas;
    totalProductos.textContent = anuladas;
}

async function cargarReportesVentas() {
    mostrarCargaReportes();
    cargarFechasPorDefecto();

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            mostrarMensajeReportes('No hay sesión activa. Inicia sesión nuevamente.');
            return;
        }

        const params = new URLSearchParams();
        params.append('fecha_inicio', fechaInicio.value);
        params.append('fecha_fin', fechaFin.value);

        const url = `${API_REPORTES_VENTAS}?${params.toString()}`;

        console.log('URL reportes enviada:', url);

        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        const data = await respuesta.json();

        console.log('Respuesta reportes ventas:', data);

        if (!respuesta.ok || data.success === false) {
            const mensaje = data.message || data.error || 'Error al obtener reportes de ventas.';
            mostrarMensajeReportes(mensaje);
            return;
        }

        const reportes = obtenerReportesDesdeRespuesta(data).map(normalizarReporte);

        renderizarReportes(reportes);
        actualizarResumen(data.resumen, reportes);
    } catch (error) {
        console.error('Error cargando reportes de ventas:', error);
        mostrarMensajeReportes('No se pudo cargar la información de reportes desde el servidor.');
    }
}

/* =========================
   PRODUCTOS MÁS VENDIDOS
========================= */

function mostrarCargaProductos() {
    if (!tablaProductosMasVendidos) return;

    tablaProductosMasVendidos.innerHTML = `
        <tr>
            <td colspan="3" class="sin-datos">
                Cargando productos más vendidos...
            </td>
        </tr>
    `;
}

function mostrarMensajeProductos(mensaje) {
    if (!tablaProductosMasVendidos) return;

    tablaProductosMasVendidos.innerHTML = `
        <tr>
            <td colspan="3" class="sin-datos">
                ${mensaje}
            </td>
        </tr>
    `;
}

function normalizarProducto(producto) {
    return {
        nombre:
            producto.producto ||
            producto.nombreProducto ||
            producto.nombre_producto ||
            producto.NombreProducto ||
            producto.nombre ||
            producto.Nombre ||
            'Sin nombre',

        cantidad:
            Number(
                producto.cantidad_vendida ||
                producto.cantidadVendida ||
                producto.total_vendido ||
                producto.totalVendido ||
                producto.cantidad ||
                producto.Cantidad ||
                0
            ),

        total:
            Number(
                producto.total_generado ||
                producto.totalGenerado ||
                producto.total_ingresos ||
                producto.total ||
                producto.Total ||
                producto.monto ||
                0
            )
    };
}

function obtenerProductosDesdeRespuesta(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    if (Array.isArray(data.productos)) {
        return data.productos;
    }

    if (Array.isArray(data.resultado)) {
        return data.resultado;
    }

    return [];
}

function renderizarProductosMasVendidos(productos) {
    if (!tablaProductosMasVendidos) return;

    tablaProductosMasVendidos.innerHTML = '';

    if (!productos || productos.length === 0) {
        tablaProductosMasVendidos.innerHTML = `
            <tr>
                <td colspan="3" class="sin-datos">
                    No hay productos vendidos para el rango de fechas seleccionado.
                </td>
            </tr>
        `;
        return;
    }

    productos.forEach((producto) => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>${formatearDinero(producto.total)}</td>
        `;

        tablaProductosMasVendidos.appendChild(fila);
    });
}

async function cargarProductosMasVendidos() {
    mostrarCargaProductos();
    cargarFechasPorDefecto();

    try {
        const token = localStorage.getItem('token');

        if (!token) {
            mostrarMensajeProductos('No hay sesión activa. Inicia sesión nuevamente.');
            return;
        }

        const params = new URLSearchParams();
        params.append('fecha_inicio', fechaInicio.value);
        params.append('fecha_fin', fechaFin.value);

        const url = `${API_PRODUCTOS_MAS_VENDIDOS}?${params.toString()}`;

        console.log('URL productos más vendidos:', url);

        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        const data = await respuesta.json();

        console.log('Respuesta productos más vendidos:', data);

        if (!respuesta.ok || data.success === false) {
            const mensaje = data.message || data.error || 'Error al obtener productos más vendidos.';
            mostrarMensajeProductos(mensaje);
            return;
        }

        const productos = obtenerProductosDesdeRespuesta(data)
            .map(normalizarProducto)
            .sort((a, b) => b.cantidad - a.cantidad);

        renderizarProductosMasVendidos(productos);
    } catch (error) {
        console.error('Error cargando productos más vendidos:', error);
        mostrarMensajeProductos('No se pudo cargar la información de productos más vendidos.');
    }
}

/* =========================
   ACCIONES
========================= */

function cargarTodo() {
    cargarReportesVentas();
    cargarProductosMasVendidos();
}

function limpiarFiltros() {
    fechaInicio.value = obtenerPrimerDiaMes();
    fechaFin.value = obtenerFechaActual();

    cargarTodo();
}

btnBuscarReporte.addEventListener('click', cargarTodo);
btnLimpiarReporte.addEventListener('click', limpiarFiltros);
btnExportarPDF.addEventListener('click', exportarPDF);

cargarTodo();