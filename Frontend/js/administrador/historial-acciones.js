
console.log("historial-acciones.js cargado correctamente");

const API_HISTORIAL = "http://localhost:3000/api/auditoria";

const tablaHistorialAcciones = document.getElementById("tablaHistorialAcciones");

const filtroUsuario = document.getElementById("filtroUsuario");
const filtroModulo = document.getElementById("filtroModulo");
const filtroAccion = document.getElementById("filtroAccion");
const filtroFecha = document.getElementById("filtroFecha");

const btnBuscarHistorial = document.getElementById("btnBuscarHistorial");
const btnLimpiarHistorial = document.getElementById("btnLimpiarHistorial");

// Obtener token
function getToken() {
    return localStorage.getItem("token");
}

// Mostrar mensaje dentro de la tabla
function mostrarMensaje(mensaje) {
    if (!tablaHistorialAcciones) return;

    tablaHistorialAcciones.innerHTML = `
        <tr>
            <td colspan="5" class="sin-registros">
                ${mensaje}
            </td>
        </tr>
    `;
}

// Cargar historial desde backend
async function cargarHistorialAcciones() {
    console.log("Ejecutando cargarHistorialAcciones");

    try {
        const token = getToken();

        if (!token) {
            mostrarMensaje("No hay sesión activa. Inicia sesión nuevamente.");
            console.warn("No hay token en localStorage");
            return;
        }

        const params = new URLSearchParams();

        // Backend espera usuario_id, pero el input dice usuario.
        // Si escribís un número, se manda como usuario_id.
        if (filtroUsuario && filtroUsuario.value.trim() !== "") {
            params.append("usuario_id", filtroUsuario.value.trim());
        }

        if (filtroModulo && filtroModulo.value !== "") {
            params.append("modulo", filtroModulo.value);
        }

        if (filtroAccion && filtroAccion.value !== "") {
            params.append("accion", filtroAccion.value);
        }

        if (filtroFecha && filtroFecha.value !== "") {
            params.append("fecha_inicio", filtroFecha.value);
            params.append("fecha_fin", filtroFecha.value);
        }

        params.append("page", "1");
        params.append("limit", "20");

        const url = `${API_HISTORIAL}?${params.toString()}`;

        console.log("Consultando API:", url);

        mostrarMensaje("Cargando historial de acciones...");

        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const resultado = await respuesta.json();

        console.log("Respuesta del backend:", resultado);

        if (!respuesta.ok || resultado.success === false) {
            throw new Error(resultado.message || "Error al cargar el historial de acciones.");
        }

        const datos = Array.isArray(resultado)
            ? resultado
            : resultado.data || resultado.historial || resultado.auditoria || [];

        mostrarHistorial(datos);

    } catch (error) {
        console.error("Error al cargar historial:", error);
        mostrarMensaje("No se pudo cargar el historial de acciones.");
    }
}

// Mostrar datos en la tabla
function mostrarHistorial(datos) {
    if (!tablaHistorialAcciones) return;

    tablaHistorialAcciones.innerHTML = "";

    if (!datos || datos.length === 0) {
        mostrarMensaje("No se encontraron acciones registradas.");
        return;
    }

    datos.forEach((item) => {
        const usuario =
            item.usuario_nombre ||
            item.usuario ||
            item.Nombre_Usuario ||
            item.nombre_usuario ||
            item.usuario_id ||
            "Sin usuario";

        const accion =
            item.accion ||
            item.Accion ||
            "Sin acción";

        const modulo =
            item.modulo ||
            item.Modulo ||
            "Sin módulo";

        const descripcion =
            item.descripcion ||
            item.Descripcion ||
            "Sin descripción";

        const fecha =
            item.fecha ||
            item.Fecha ||
            item.created_at ||
            item.createdAt ||
            "";

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${usuario}</td>
            <td>
                <span class="badge-accion ${String(accion).toLowerCase()}">
                    ${accion}
                </span>
            </td>
            <td>${modulo}</td>
            <td>${descripcion}</td>
            <td>${formatearFecha(fecha)}</td>
        `;

        tablaHistorialAcciones.appendChild(fila);
    });
}

// Limpiar filtros
function limpiarFiltros() {
    console.log("Limpiando filtros");

    if (filtroUsuario) filtroUsuario.value = "";
    if (filtroModulo) filtroModulo.value = "";
    if (filtroAccion) filtroAccion.value = "";
    if (filtroFecha) filtroFecha.value = "";

    cargarHistorialAcciones();
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado en historial-acciones");

    if (!tablaHistorialAcciones) {
        console.error("No se encontró tbody con id tablaHistorialAcciones");
        return;
    }

    if (btnBuscarHistorial) {
        btnBuscarHistorial.addEventListener("click", () => {
            console.log("Click en botón Buscar");
            cargarHistorialAcciones();
        });
    } else {
        console.error("No se encontró botón con id btnBuscarHistorial");
    }

    if (btnLimpiarHistorial) {
        btnLimpiarHistorial.addEventListener("click", () => {
            console.log("Click en botón Limpiar");
            limpiarFiltros();
        });
    } else {
        console.error("No se encontró botón con id btnLimpiarHistorial");
    }

    cargarHistorialAcciones();
});