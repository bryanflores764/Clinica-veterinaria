// ============================================================
// Archivo: js/veterinario/interfazPacientes.js
// Vista: Pacientes del veterinario
// Función: Mostrar pacientes registrados y permitir búsqueda
// ============================================================

const URL_API = "http://localhost:3000";

// Elementos del DOM
const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");
const menuToggle = document.querySelector(".menu-toggle");

// Datos en memoria
let mascotas = [];

// ============================================================
// Sesión
// ============================================================

function obtenerToken() {
    return localStorage.getItem("token");
}

function verificarSesion() {
    const token = obtenerToken();

    if (!token || token === "null" || token === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.replace("../../index.html");
    }
}

function obtenerEncabezados() {
    const token = obtenerToken();

    return {
        Authorization: `Bearer ${token}`
    };
}

// ============================================================
// Carga de pacientes
// ============================================================

async function cargarMascotas() {
    try {
        const respuesta = await fetch(`${URL_API}/api/mascotas`, {
            method: "GET",
            headers: obtenerEncabezados()
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudieron cargar los pacientes.");
        }

        mascotas = Array.isArray(resultado.data) ? resultado.data : [];

        mascotas.sort((a, b) => Number(a.Id) - Number(b.Id));

        renderizarMascotas(mascotas);

    } catch (error) {
        console.error("Error al cargar pacientes:", error);
        mostrarMensajeVacio("No se pudieron cargar los pacientes.");
    }
}

// ============================================================
// Renderizado de tabla
// ============================================================

function renderizarMascotas(listaMascotas) {
    tbody.innerHTML = "";

    if (!listaMascotas || listaMascotas.length === 0) {
        mostrarMensajeVacio("No hay pacientes para mostrar.");
        return;
    }

    ocultarMensajeVacio();

    listaMascotas.forEach((mascota) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td style="text-align: center;">${escapeHtml(mascota.Nombre)}</td>
            <td style="text-align: center;">${escapeHtml(mascota.Nombre_Especie)}</td>
            <td style="text-align: center;">${escapeHtml(mascota.Nombre_Raza)}</td>
            <td style="text-align: center;">${formatearPeso(mascota.Peso)}</td>
            <td style="text-align: center;">${formatearFecha(mascota.Fecha_Nacimiento)}</td>
            <td style="text-align: center;">${escapeHtml(mascota.Propietario)}</td>
            <td style="text-align: center;">
                <button 
                    type="button"
                    class="btn-accion btn-historial"
                    data-id="${mascota.Id}">
                    Historial clínico
                </button>
                <button type="button" class="btn-accion btn-vacunacion" 
                data-id="${mascota.Id}" data-nombre="${escapeHtml(mascota.Nombre ?? "")}">
                Cartilla de vacunación
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

function mostrarMensajeVacio(mensaje) {
    tbody.innerHTML = "";
    emptyMsg.textContent = mensaje;
    emptyMsg.style.display = "block";
}

function ocultarMensajeVacio() {
    emptyMsg.style.display = "none";
}

// ============================================================
// Búsqueda
// ============================================================

function configurarBusqueda() {
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const texto = searchInput.value.trim().toLowerCase();

        const mascotasFiltradas = mascotas.filter((mascota) => {
            const nombre = String(mascota.Nombre || "").toLowerCase();
            const propietario = String(mascota.Propietario || "").toLowerCase();

            return nombre.includes(texto) || propietario.includes(texto);
        });

        renderizarMascotas(mascotasFiltradas);
    });
}

// ============================================================
// Botón historial clínico
// ============================================================

function configurarBotonHistorial() {
    tbody.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-historial");

        if (!boton) return;

        const mascotaId = boton.dataset.id;

        console.log("Mascota seleccionada para historial clínico:", mascotaId);

        // Cuando tengas la vista de historial, puedes redireccionar así:
        // window.location.href = `historialClinico.html?mascotaId=${mascotaId}`;
    });
}

// ============================================================
// Menú móvil
// ============================================================

function configurarMenuMovil() {
    if (!menuToggle) return;

    menuToggle.addEventListener("click", () => {
        const menuAbierto = document.body.classList.toggle("menu-open");
        menuToggle.setAttribute("aria-expanded", menuAbierto ? "true" : "false");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.body.classList.remove("menu-open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// ============================================================
// Utilidades
// ============================================================

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) return "";

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}-${mes}-${anio}`;
}

function formatearPeso(peso) {
    if (peso === null || peso === undefined || peso === "") return "";

    const pesoNumero = Number(peso);

    if (isNaN(pesoNumero)) return "";

    return pesoNumero % 1 === 0
        ? pesoNumero.toString()
        : pesoNumero.toFixed(2);
}

function escapeHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================
// Inicio
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    configurarMenuMovil();
    configurarBusqueda();
    configurarBotonHistorial();
    cargarMascotas();
});