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
const modalDetalleHistorial = document.getElementById("modal-detalle-historial");
const btnCerrarModalDetalleHistorial = document.getElementById("cerrar-modal-detalle-historial");
const detalleMascotaNombre = document.getElementById("detalle-mascota-nombre");
const detalleMascotaEspecie = document.getElementById("detalle-mascota-especie");
const detalleMascotaRaza = document.getElementById("detalle-mascota-raza");
const detalleMascotaPropietario = document.getElementById("detalle-mascota-propietario");
const detalleMotivo = document.getElementById("detalle-motivo");
const detalleDiagnosticoInicial = document.getElementById("detalle-diagnostico-inicial");
const detalleObservaciones = document.getElementById("detalle-observaciones");
const listaConsultas = document.getElementById("lista-consultas");
const consultasEmptyMsg = document.getElementById("consultas-empty-msg");
const filtroFechaConsulta = document.getElementById("filtro-fecha-consulta");
const btnLimpiarFiltroConsultas = document.getElementById("limpiar-filtro-consultas");
const btnAgregarConsulta = document.getElementById("btn-agregar-consulta");
const modalConsulta = document.getElementById("modal-consulta");
const formConsulta = document.getElementById("form-consulta");
const btnCerrarModalConsulta = document.getElementById("cerrar-modal-consulta");
const btnCancelarConsulta = document.getElementById("cancelar-consulta");
const inputConsultaHistorialId = document.getElementById("consulta-historial-id");
const inputConsultaFecha = document.getElementById("consulta-fecha");
const inputConsultaSintomas = document.getElementById("consulta-sintomas");
const inputConsultaDiagnostico = document.getElementById("consulta-diagnostico");
const inputConsultaTratamiento = document.getElementById("consulta-tratamiento");
const inputConsultaObservaciones = document.getElementById("consulta-observaciones");

// Datos en memoria
let mascotas = [];
let consultasHistorialActual = [];
let historialActualId = null;

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
            const historialEncontrado = Array.isArray(resultado.data)
                ? resultado.data[0]
                : resultado.data;

            if (historialEncontrado) {
                abrirModalDetalleHistorial(mascota, historialEncontrado);
                return;
            }
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

async function abrirModalDetalleHistorial(mascota, historial) {
    limpiarDetalleHistorial();

    console.log("Historial recibido:", historial);

    detalleMascotaNombre.textContent = mascota.Nombre || historial.mascota_nombre || "-";
    detalleMascotaEspecie.textContent = mascota.Nombre_Especie || "-";
    detalleMascotaRaza.textContent = mascota.Nombre_Raza || "-";
    detalleMascotaPropietario.textContent = mascota.Propietario || "-";

    detalleMotivo.textContent = historial.motivo || "-";
    detalleDiagnosticoInicial.textContent = historial.diagnostico_inicial || "-";
    detalleObservaciones.textContent = historial.observaciones || "-";

    modalDetalleHistorial.classList.add("show");

    const historialId = historial.id || historial.Id || historial.historial_id || historial.HistorialId;
    historialActualId = historialId || null;

    if (historialId) {
        await cargarConsultasHistorial(historialId);
    } else {
        renderizarConsultas([]);
    }
}

function cerrarModalDetalleHistorial() {
    modalDetalleHistorial.classList.remove("show");
    limpiarDetalleHistorial();
}

function limpiarDetalleHistorial() {
    detalleMascotaNombre.textContent = "-";
    detalleMascotaEspecie.textContent = "-";
    detalleMascotaRaza.textContent = "-";
    detalleMascotaPropietario.textContent = "-";

    detalleMotivo.textContent = "-";
    detalleDiagnosticoInicial.textContent = "-";
    detalleObservaciones.textContent = "-";

    consultasHistorialActual = [];
    historialActualId = null;
    listaConsultas.innerHTML = "";
    consultasEmptyMsg.style.display = "block";

    if (filtroFechaConsulta) {
        filtroFechaConsulta.value = "";
    }
}

async function cargarConsultasHistorial(historialId) {
    try {
        const respuesta = await fetch(`${URL_API}/api/historial/${historialId}/consultas`, {
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
            consultasHistorialActual = [];
            renderizarConsultas([]);
            return;
        }

        consultasHistorialActual = Array.isArray(resultado.data) ? resultado.data : [];

        consultasHistorialActual.sort((a, b) => {
            const fechaA = new Date(a.fecha || a.Fecha || a.Fecha_Consulta || 0);
            const fechaB = new Date(b.fecha || b.Fecha || b.Fecha_Consulta || 0);

            return fechaA - fechaB;
        });

        renderizarConsultas(consultasHistorialActual);

    } catch (error) {
        console.error("Error al cargar consultas médicas:", error);
        consultasHistorialActual = [];
        renderizarConsultas([]);
    }
}

function renderizarConsultas(consultas) {
    listaConsultas.innerHTML = "";

    if (!consultas || consultas.length === 0) {
        consultasEmptyMsg.style.display = "block";
        return;
    }

    consultasEmptyMsg.style.display = "none";

    consultas.forEach((consulta) => {
        const item = document.createElement("article");
        item.classList.add("consulta-item");

        const fechaConsulta = consulta.fecha || consulta.Fecha || consulta.Fecha_Consulta;
        const sintomas = consulta.sintomas || consulta.Sintomas || "-";
        const diagnostico = consulta.diagnostico || consulta.Diagnostico || "-";
        const tratamiento = consulta.tratamiento || consulta.Tratamiento || "-";
        const observaciones = consulta.observaciones || consulta.Observaciones || "-";

        item.innerHTML = `
            <h4>Consulta del ${formatearFecha(fechaConsulta)}</h4>
            <p><strong>Síntomas:</strong> ${escapeHtml(sintomas)}</p>
            <p><strong>Diagnóstico:</strong> ${escapeHtml(diagnostico)}</p>
            <p><strong>Tratamiento:</strong> ${escapeHtml(tratamiento)}</p>
            <p><strong>Observaciones:</strong> ${escapeHtml(observaciones)}</p>
        `;

        listaConsultas.appendChild(item);
    });
}

function abrirModalConsulta() {
    if (!historialActualId) {
        alert("No se encontró el historial clínico seleccionado.");
        return;
    }

    limpiarFormularioConsulta();

    inputConsultaHistorialId.value = historialActualId;

    modalConsulta.classList.add("show");
}

function cerrarModalConsulta() {
    modalConsulta.classList.remove("show");
    limpiarFormularioConsulta();
}

function limpiarFormularioConsulta() {
    formConsulta.reset();
    limpiarErroresFormularioConsulta();
}

function configurarModalConsulta() {
    btnAgregarConsulta.addEventListener("click", abrirModalConsulta);
    btnCerrarModalConsulta.addEventListener("click", cerrarModalConsulta);
    btnCancelarConsulta.addEventListener("click", cerrarModalConsulta);

    modalConsulta.addEventListener("click", (e) => {
        if (e.target === modalConsulta) {
            cerrarModalConsulta();
        }
    });

    formConsulta.addEventListener("submit", guardarConsultaMedica);
}

async function guardarConsultaMedica(e) {
    e.preventDefault();

    const historialId = inputConsultaHistorialId.value;
    const fecha = inputConsultaFecha.value;
    const sintomas = inputConsultaSintomas.value.trim();
    const diagnostico = inputConsultaDiagnostico.value.trim();
    const tratamiento = inputConsultaTratamiento.value.trim();
    const observaciones = inputConsultaObservaciones.value.trim();

    const formularioValido = validarFormularioConsulta({
        fecha,
        sintomas,
        diagnostico,
        tratamiento,
        observaciones
    });

    if (!formularioValido) return;

    const veterinarioId = obtenerVeterinarioId();

    if (!veterinarioId) {
        alert("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    const datosConsulta = {
        historial_id: Number(historialId),
        fecha: fecha,
        sintomas: sintomas,
        diagnostico: diagnostico,
        tratamiento: tratamiento,
        observaciones: observaciones,
        veterinario_id: Number(veterinarioId)
    };

    try {
        const respuesta = await fetch(`${URL_API}/api/historial/consultas`, {
            method: "POST",
            headers: obtenerEncabezados(true),
            body: JSON.stringify(datosConsulta)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo registrar la consulta médica.");
        }

        alert("Consulta médica registrada correctamente.");

        cerrarModalConsulta();

        await cargarConsultasHistorial(Number(historialId));

    } catch (error) {
        console.error("Error al registrar consulta médica:", error);
        alert(error.message || "Ocurrió un error al registrar la consulta médica.");
    }
}

function validarFormularioConsulta(datos) {
    limpiarErroresFormularioConsulta();

    let valido = true;

    if (!datos.fecha) {
        mostrarErrorCampoConsulta(inputConsultaFecha, "La fecha y hora son obligatorias.");
        valido = false;
    }

    if (!datos.sintomas) {
        mostrarErrorCampoConsulta(inputConsultaSintomas, "Los síntomas son obligatorios.");
        valido = false;
    }

    if (!datos.diagnostico) {
        mostrarErrorCampoConsulta(inputConsultaDiagnostico, "El diagnóstico es obligatorio.");
        valido = false;
    }

    if (!datos.tratamiento) {
        mostrarErrorCampoConsulta(inputConsultaTratamiento, "El tratamiento es obligatorio.");
        valido = false;
    }

    if (!datos.observaciones) {
        mostrarErrorCampoConsulta(inputConsultaObservaciones, "Las observaciones son obligatorias.");
        valido = false;
    }

    return valido;
}

function mostrarErrorCampoConsulta(input, mensaje) {
    const formGroup = input.closest(".form-group");
    const errorMsg = formGroup.querySelector(".error-msg");

    formGroup.classList.add("error");
    errorMsg.textContent = mensaje;
}

function limpiarErroresFormularioConsulta() {
    const grupos = formConsulta.querySelectorAll(".form-group");

    grupos.forEach((grupo) => {
        grupo.classList.remove("error");

        const errorMsg = grupo.querySelector(".error-msg");

        if (errorMsg) {
            errorMsg.textContent = "";
        }
    });
}

function configurarFiltrosConsultas() {
    if (!filtroFechaConsulta || !btnLimpiarFiltroConsultas) return;

    filtroFechaConsulta.addEventListener("change", () => {
        const fechaFiltro = filtroFechaConsulta.value;

        if (!fechaFiltro) {
            renderizarConsultas(consultasHistorialActual);
            return;
        }

        const consultasFiltradas = consultasHistorialActual.filter((consulta) => {
            const fechaConsulta = consulta.fecha || consulta.Fecha || consulta.Fecha_Consulta;

            if (!fechaConsulta) return false;

            return obtenerFechaInput(fechaConsulta) === fechaFiltro;
        });

        renderizarConsultas(consultasFiltradas);
    });

    btnLimpiarFiltroConsultas.addEventListener("click", () => {
        filtroFechaConsulta.value = "";
        renderizarConsultas(consultasHistorialActual);
    });
}

function obtenerFechaInput(fecha) {
    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) return "";

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
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

    btnCerrarModalDetalleHistorial.addEventListener("click", cerrarModalDetalleHistorial);

    modalHistorial.addEventListener("click", (e) => {
        if (e.target === modalHistorial) {
            cerrarModalCrearHistorial();
        }
    });

    modalDetalleHistorial.addEventListener("click", (e) => {
        if (e.target === modalDetalleHistorial) {
            cerrarModalDetalleHistorial();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalHistorial.classList.contains("show")) {
            cerrarModalCrearHistorial();
        }

        if (e.key === "Escape" && modalDetalleHistorial.classList.contains("show")) {
            cerrarModalDetalleHistorial();
        }

        if (e.key === "Escape" && modalConsulta.classList.contains("show")) {
            cerrarModalConsulta();
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
    configurarModalConsulta();
    configurarFiltrosConsultas();
    cargarMascotas();
});