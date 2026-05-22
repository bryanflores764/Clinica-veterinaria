
console.log("historial-acciones.js cargado correctamente");

const API_HISTORIAL = "http://localhost:3000/api/auditoria";

const tablaHistorialAcciones = document.getElementById("tablaHistorialAcciones");

const filtroUsuario = document.getElementById("filtroUsuario");
const filtroModulo = document.getElementById("filtroModulo");
const filtroAccion = document.getElementById("filtroAccion");
const filtroFecha = document.getElementById("filtroFecha");

const btnBuscarHistorial = document.getElementById("btnBuscarHistorial");
const btnLimpiarHistorial = document.getElementById("btnLimpiarHistorial");

function getToken() {
    return localStorage.getItem("token");
}

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

function normalizarModulo(modulo) {
    const modulos = {
        "Usuarios": "usuarios",
        "usuarios": "usuarios",
        "Clientes": "clientes",
        "clientes": "clientes",
        "Mascotas": "mascotas",
        "mascotas": "mascotas",
        "Productos": "productos",
        "productos": "productos",
        "Ventas": "ventas",
        "ventas": "ventas"
    };

    return modulos[modulo] || modulo;
}

function normalizarAccion(accion) {
    const acciones = {
        "Crear": "CREATE",
        "crear": "CREATE",
        "CREATE": "CREATE",

        "Editar": "UPDATE",
        "editar": "UPDATE",
        "UPDATE": "UPDATE",

        "Eliminar": "DELETE",
        "eliminar": "DELETE",
        "DELETE": "DELETE",

        "Agregar detalle": "ADD_DETALLE",
        "ADD_DETALLE": "ADD_DETALLE",

        "Confirmar": "CONFIRMAR",
        "CONFIRMAR": "CONFIRMAR"
    };

    return acciones[accion] || accion;
}

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

        if (filtroUsuario && filtroUsuario.value.trim() !== "") {
            params.append("usuario_id", filtroUsuario.value.trim());
        }

        if (filtroModulo && filtroModulo.value !== "") {
            params.append("modulo", normalizarModulo(filtroModulo.value));
        }

        if (filtroAccion && filtroAccion.value !== "") {
            params.append("accion", normalizarAccion(filtroAccion.value));
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

        const datosFiltrados = filtrarDatosLocalmente(datos);

        mostrarHistorial(datosFiltrados);

    } catch (error) {
        console.error("Error al cargar historial:", error);
        mostrarMensaje("No se pudo cargar el historial de acciones.");
    }
}

function filtrarDatosLocalmente(datos) {
    let datosFiltrados = datos;

    const usuarioFiltro = filtroUsuario ? filtroUsuario.value.trim().toLowerCase() : "";
    const moduloFiltro = filtroModulo ? normalizarModulo(filtroModulo.value.trim()).toLowerCase() : "";
    const accionFiltro = filtroAccion ? normalizarAccion(filtroAccion.value.trim()).toUpperCase() : "";
    const fechaFiltro = filtroFecha ? filtroFecha.value : "";

    if (usuarioFiltro !== "") {
        datosFiltrados = datosFiltrados.filter((item) => {
            const usuario = String(
                item.usuario_nombre ||
                item.usuario ||
                item.Nombre_Usuario ||
                item.nombre_usuario ||
                item.usuario_id ||
                ""
            ).toLowerCase();

            return usuario.includes(usuarioFiltro);
        });
    }

    if (moduloFiltro !== "") {
        datosFiltrados = datosFiltrados.filter((item) => {
            const modulo = String(
                item.modulo ||
                item.Modulo ||
                ""
            ).toLowerCase();

            return modulo === moduloFiltro;
        });
    }

    if (accionFiltro !== "") {
        datosFiltrados = datosFiltrados.filter((item) => {
            const accion = String(
                item.accion ||
                item.Accion ||
                ""
            ).toUpperCase();

            return accion === accionFiltro;
        });
    }

    if (fechaFiltro !== "") {
        datosFiltrados = datosFiltrados.filter((item) => {
            const fecha = item.fecha || item.Fecha || item.created_at || item.createdAt || "";

            if (!fecha) return false;

            const fechaItem = new Date(fecha).toISOString().split("T")[0];

            return fechaItem === fechaFiltro;
        });
    }

    return datosFiltrados;
}

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
                    ${formatearAccion(accion)}
                </span>
            </td>
            <td>${formatearModulo(modulo)}</td>
            <td>${descripcion}</td>
            <td>${formatearFecha(fecha)}</td>
        `;

        tablaHistorialAcciones.appendChild(fila);
    });
}

function limpiarFiltros() {
    console.log("Limpiando filtros");

    if (filtroUsuario) filtroUsuario.value = "";
    if (filtroModulo) filtroModulo.value = "";
    if (filtroAccion) filtroAccion.value = "";
    if (filtroFecha) filtroFecha.value = "";

    cargarHistorialAcciones();
}

function formatearAccion(accion) {
    const acciones = {
        "CREATE": "Crear",
        "UPDATE": "Editar",
        "DELETE": "Eliminar",
        "ADD_DETALLE": "Agregar detalle",
        "CONFIRMAR": "Confirmar"
    };

    return acciones[accion] || accion;
}

function formatearModulo(modulo) {
    const modulos = {
        "usuarios": "Usuarios",
        "Usuarios": "Usuarios",
        "clientes": "Clientes",
        "Clientes": "Clientes",
        "mascotas": "Mascotas",
        "Mascotas": "Mascotas",
        "productos": "Productos",
        "Productos": "Productos",
        "ventas": "Ventas",
        "Ventas": "Ventas"
    };

    return modulos[modulo] || modulo;
}

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