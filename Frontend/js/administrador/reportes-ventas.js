const API_REPORTES_VENTAS = 'http://localhost:3000/api/reportes/ventas';
const API_PRODUCTOS_MAS_VENDIDOS = 'http://localhost:3000/api/reportes/productos-mas-vendidos';

const tablaReportesVentas = document.getElementById('tablaReportesVentas');
const tablaProductosMasVendidos = document.getElementById('tablaProductosMasVendidos');

const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');
const btnBuscarReporte = document.getElementById('btnBuscarReporte');
const btnLimpiarReporte = document.getElementById('btnLimpiarReporte');

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

cargarTodo();