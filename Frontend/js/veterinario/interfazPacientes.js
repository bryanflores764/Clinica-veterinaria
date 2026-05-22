// ============================================================
// Archivo: js/veterinario/interfazPacientes.js
// Vista: Pacientes del veterinario
// ============================================================

const URL_API = "http://localhost:3000";

// Elementos del DOM
const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");
const menuToggle = document.querySelector(".menu-toggle");
const modalHistorial = document.getElementById("modal-historial");
const formHistorial = document.getElementById("form-historial");
const btnCerrarModalHistorial = document.getElementById("cerrar-modal-historial");
const btnCancelarHistorial = document.getElementById("cancelar-historial");
const inputMascotaIdHistorial = document.getElementById("historial-mascota-id");
const inputMascotaNombreHistorial = document.getElementById("historial-mascota-nombre");
const inputMotivo = document.getElementById("motivo");
const inputDiagnosticoInicial = document.getElementById("diagnostico-inicial");
const inputObservaciones = document.getElementById("observaciones");

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

function obtenerEncabezados(conJson = false) {
    const token = obtenerToken();

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (conJson) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
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
// Historial clínico
// ============================================================

function configurarBotonHistorial() {
    tbody.addEventListener("click", async (e) => {
        const boton = e.target.closest(".btn-historial");

        if (!boton) return;

        const mascotaId = boton.dataset.id;
        const mascotaSeleccionada = mascotas.find((mascota) => String(mascota.Id) === String(mascotaId));

        if (!mascotaSeleccionada) {
            alert("No se encontró la información de la mascota seleccionada.");
            return;
        }

        await verificarHistorialMascota(mascotaSeleccionada);
    });
}

async function verificarHistorialMascota(mascota) {
    try {
        const respuesta = await fetch(`${URL_API}/api/historial/mascota/${mascota.Id}`, {
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

        if (respuesta.ok && resultado.data) {
            alert("Esta mascota ya tiene un historial clínico registrado.");
            console.log("Historial existente:", resultado.data);
            return;
        }

        abrirModalCrearHistorial(mascota);

    } catch (error) {
        console.error("Error al verificar historial clínico:", error);
        abrirModalCrearHistorial(mascota);
    }
}

function abrirModalCrearHistorial(mascota) {
    limpiarFormularioHistorial();

    inputMascotaIdHistorial.value = mascota.Id;
    inputMascotaNombreHistorial.value = mascota.Nombre || "";

    modalHistorial.classList.add("show");
}

function cerrarModalCrearHistorial() {
    modalHistorial.classList.remove("show");
    limpiarFormularioHistorial();
}

function limpiarFormularioHistorial() {
    formHistorial.reset();
    limpiarErroresFormulario();
}

function configurarModalHistorial() {
    btnCerrarModalHistorial.addEventListener("click", cerrarModalCrearHistorial);
    btnCancelarHistorial.addEventListener("click", cerrarModalCrearHistorial);

    modalHistorial.addEventListener("click", (e) => {
        if (e.target === modalHistorial) {
            cerrarModalCrearHistorial();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalHistorial.classList.contains("show")) {
            cerrarModalCrearHistorial();
        }
    });

    formHistorial.addEventListener("submit", guardarHistorialClinico);
}

async function guardarHistorialClinico(e) {
    e.preventDefault();

    const mascotaId = inputMascotaIdHistorial.value;
    const motivo = inputMotivo.value.trim();
    const diagnosticoInicial = inputDiagnosticoInicial.value.trim();
    const observaciones = inputObservaciones.value.trim();

    const formularioValido = validarFormularioHistorial({
        motivo,
        diagnosticoInicial,
        observaciones
    });

    if (!formularioValido) return;

    const veterinarioId = obtenerVeterinarioId();

    if (!veterinarioId) {
        alert("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    const datosHistorial = {
        mascota_id: Number(mascotaId),
        motivo: motivo,
        diagnostico_inicial: diagnosticoInicial,
        observaciones: observaciones,
        veterinario_id: Number(veterinarioId)
    };

    try {
        const respuesta = await fetch(`${URL_API}/api/historial`, {
            method: "POST",
            headers: obtenerEncabezados(true),
            body: JSON.stringify(datosHistorial)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo crear el historial clínico.");
        }

        alert("Historial clínico creado correctamente.");
        console.log("Historial creado:", resultado.data);

        cerrarModalCrearHistorial();

    } catch (error) {
        console.error("Error al crear historial clínico:", error);
        alert(error.message || "Ocurrió un error al crear el historial clínico.");
    }
}

function validarFormularioHistorial(datos) {
    limpiarErroresFormulario();

    let valido = true;

    if (!datos.motivo) {
        mostrarErrorCampo(inputMotivo, "El motivo es obligatorio.");
        valido = false;
    }

    if (!datos.diagnosticoInicial) {
        mostrarErrorCampo(inputDiagnosticoInicial, "El diagnóstico inicial es obligatorio.");
        valido = false;
    }

    if (!datos.observaciones) {
        mostrarErrorCampo(inputObservaciones, "Las observaciones son obligatorias.");
        valido = false;
    }

    return valido;
}

function mostrarErrorCampo(input, mensaje) {
    const formGroup = input.closest(".form-group");
    const errorMsg = formGroup.querySelector(".error-msg");

    formGroup.classList.add("error");
    errorMsg.textContent = mensaje;
}

function limpiarErroresFormulario() {
    const grupos = formHistorial.querySelectorAll(".form-group");

    grupos.forEach((grupo) => {
        grupo.classList.remove("error");

        const errorMsg = grupo.querySelector(".error-msg");

        if (errorMsg) {
            errorMsg.textContent = "";
        }
    });
}

function obtenerVeterinarioId() {
    const usuarioStorage = localStorage.getItem("usuario");

    if (!usuarioStorage) return null;

    try {
        const usuario = JSON.parse(usuarioStorage);

        return usuario.id || usuario.Id || usuario.veterinario_id || usuario.VeterinarioId || null;

    } catch (error) {
        console.error("Error al leer usuario desde localStorage:", error);
        return null;
    }
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
    configurarModalHistorial();
    cargarMascotas();
});