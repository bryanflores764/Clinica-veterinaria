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

// Cartilla de vacunación
const modalCartilla = document.getElementById("modal-cartilla");
const btnCerrarModalCartilla = document.getElementById("cerrar-modal-cartilla");
const formVacuna = document.getElementById("form-vacuna");
const btnToggleFormVacuna = document.getElementById("btn-toggle-form-vacuna");
const btnCancelarVacuna = document.getElementById("cancelar-vacuna");
const inputVacunaMascotaId = document.getElementById("vacuna-mascota-id");

// Datos en memoria
let mascotas = [];
let consultasHistorialActual = [];
let vacunasActuales = [];
let mascotaCartillaActual = null;

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

    const historialId = historial.id;

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
// Cartilla de vacunación
// ============================================================

function configurarBotonVacunacion() {
    tbody.addEventListener("click", async (e) => {
        const boton = e.target.closest(".btn-vacunacion");
        if (!boton) return;

        const mascotaId = boton.dataset.id;
        const mascotaSeleccionada = mascotas.find((m) => String(m.Id) === String(mascotaId));

        if (!mascotaSeleccionada) {
            alert("No se encontró la información de la mascota seleccionada.");
            return;
        }

        await abrirModalCartilla(mascotaSeleccionada);
    });
}

async function abrirModalCartilla(mascota) {
    mascotaCartillaActual = mascota;

    document.getElementById("cartilla-nombre").textContent = mascota.Nombre || "-";
    document.getElementById("cartilla-especie").textContent = mascota.Nombre_Especie || "-";
    document.getElementById("cartilla-raza").textContent = mascota.Nombre_Raza || "-";
    document.getElementById("cartilla-color").textContent = mascota.Color || "-";
    document.getElementById("cartilla-fecha-nacimiento").textContent = formatearFecha(mascota.Fecha_Nacimiento) || "-";
    document.getElementById("cartilla-peso").textContent = mascota.Peso ? `${formatearPeso(mascota.Peso)} lbs` : "-";
    document.getElementById("cartilla-propietario").textContent = mascota.Propietario || "-";
    document.getElementById("cartilla-telefono").textContent = mascota.Telefono_Propietario || "-";

    inputVacunaMascotaId.value = mascota.Id;

    formVacuna.style.display = "none";
    btnToggleFormVacuna.textContent = "+ Registrar vacuna";
    limpiarFormVacuna();

    modalCartilla.classList.add("show");

    await cargarVacunas(mascota.Id);
}

function cerrarModalCartilla() {
    modalCartilla.classList.remove("show");
    mascotaCartillaActual = null;
    vacunasActuales = [];
    limpiarFormVacuna();
    formVacuna.style.display = "none";
    btnToggleFormVacuna.textContent = "+ Registrar vacuna";
}

async function cargarVacunas(mascotaId) {
    try {
        const respuesta = await fetch(`${URL_API}/api/vacunas/mascota/${mascotaId}`, {
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
        vacunasActuales = Array.isArray(resultado.data) ? resultado.data : [];

        renderizarVacunas(vacunasActuales);
        renderizarAlertas(vacunasActuales);

    } catch (error) {
        console.error("Error al cargar vacunas:", error);
        vacunasActuales = [];
        renderizarVacunas([]);
        renderizarAlertas([]);
    }
}

function renderizarVacunas(vacunas) {
    const lista = document.getElementById("cartilla-vacunas-lista");
    const emptyVacunas = document.getElementById("cartilla-vacunas-empty");

    lista.innerHTML = "";

    if (!vacunas || vacunas.length === 0) {
        emptyVacunas.style.display = "block";
        return;
    }

    emptyVacunas.style.display = "none";

    const etiquetas = {
        vencida: "Vencida",
        proxima: "Próxima",
        aplicada: "Aplicada",
        completado: "Completada"
    };

    vacunas.forEach((vacuna) => {
        const estado = vacuna.estado_vacuna || "aplicada";
        const item = document.createElement("article");
        item.classList.add("vacuna-item", estado);

        item.innerHTML = `
            <div class="vacuna-info">
                <div class="vacuna-nombre">${escapeHtml(vacuna.nombre_vacuna || "-")}</div>
                <p class="vacuna-detalle"><strong>Fecha de aplicación:</strong> ${formatearFecha(vacuna.fecha_aplicacion) || "-"}</p>
                <p class="vacuna-detalle"><strong>Próxima dosis:</strong> ${vacuna.proxima_dosis ? formatearFecha(vacuna.proxima_dosis) : "No aplica"}</p>
                ${vacuna.lote ? `<p class="vacuna-detalle"><strong>Lote:</strong> ${escapeHtml(vacuna.lote)}</p>` : ""}
                ${vacuna.observaciones ? `<p class="vacuna-detalle"><strong>Observaciones:</strong> ${escapeHtml(vacuna.observaciones)}</p>` : ""}
                <p class="vacuna-detalle"><strong>Veterinario:</strong> ${escapeHtml(vacuna.veterinario_nombre || "-")}</p>
            </div>
            <span class="vacuna-badge ${estado}">${etiquetas[estado] || estado}</span>
        `;

        lista.appendChild(item);
    });
}

function renderizarAlertas(vacunas) {
    const lista = document.getElementById("cartilla-alertas-lista");
    const emptyAlertas = document.getElementById("cartilla-alertas-empty");

    lista.innerHTML = "";

    const alertas = vacunas.filter((v) => v.estado_vacuna === "vencida" || v.estado_vacuna === "proxima");

    if (alertas.length === 0) {
        emptyAlertas.style.display = "block";
        return;
    }

    emptyAlertas.style.display = "none";

    alertas.forEach((vacuna) => {
        const esVencida = vacuna.estado_vacuna === "vencida";
        const item = document.createElement("div");
        item.classList.add("alerta-item");
        if (esVencida) item.classList.add("vencida");

        const fechaProxima = vacuna.proxima_dosis ? formatearFecha(vacuna.proxima_dosis) : "Sin fecha programada";

        item.innerHTML = `
            <p><strong>${escapeHtml(vacuna.nombre_vacuna)}</strong> — ${esVencida ? "Vacuna vencida" : "Próxima dosis"}</p>
            <p>Fecha próxima dosis: <strong>${fechaProxima}</strong></p>
        `;

        lista.appendChild(item);
    });
}

function configurarModalCartilla() {
    btnCerrarModalCartilla.addEventListener("click", cerrarModalCartilla);

    modalCartilla.addEventListener("click", (e) => {
        if (e.target === modalCartilla) cerrarModalCartilla();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalCartilla.classList.contains("show")) {
            cerrarModalCartilla();
        }
    });

    btnToggleFormVacuna.addEventListener("click", () => {
        const visible = formVacuna.style.display !== "none";
        formVacuna.style.display = visible ? "none" : "block";
        btnToggleFormVacuna.textContent = visible ? "+ Registrar vacuna" : "Ocultar formulario";
    });

    btnCancelarVacuna.addEventListener("click", () => {
        formVacuna.style.display = "none";
        btnToggleFormVacuna.textContent = "+ Registrar vacuna";
        limpiarFormVacuna();
    });

    formVacuna.addEventListener("submit", guardarVacuna);
}

async function guardarVacuna(e) {
    e.preventDefault();

    const mascotaId = inputVacunaMascotaId.value;
    const nombreVacuna = document.getElementById("vacuna-nombre").value.trim();
    const fechaAplicacion = document.getElementById("vacuna-fecha").value;
    const pesoInput = document.getElementById("vacuna-peso").value.trim();
    const proximaDosis = document.getElementById("vacuna-proxima").value;
    const lote = document.getElementById("vacuna-lote").value.trim();
    const observacionesInput = document.getElementById("vacuna-observaciones").value.trim();

    const inputNombreV = document.getElementById("vacuna-nombre");
    const inputFechaV = document.getElementById("vacuna-fecha");

    [inputNombreV, inputFechaV].forEach((inp) => {
        const fg = inp.closest(".form-group");
        fg.classList.remove("error");
        const em = fg.querySelector(".error-msg");
        if (em) em.textContent = "";
    });

    let valido = true;

    if (!nombreVacuna) {
        const fg = inputNombreV.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "El nombre de la vacuna es obligatorio.";
        valido = false;
    }

    if (!fechaAplicacion) {
        const fg = inputFechaV.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "La fecha de aplicación es obligatoria.";
        valido = false;
    }

    if (!valido) return;

    const veterinarioId = obtenerVeterinarioId();
    if (!veterinarioId) {
        alert("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    let observacionesFinal = observacionesInput;
    if (pesoInput) {
        observacionesFinal = observacionesInput
            ? `Peso: ${pesoInput} lbs. ${observacionesInput}`
            : `Peso: ${pesoInput} lbs.`;
    }

    const datosVacuna = {
        mascota_id: Number(mascotaId),
        nombre_vacuna: nombreVacuna,
        fecha_aplicacion: fechaAplicacion,
        proxima_dosis: proximaDosis || null,
        lote: lote || null,
        observaciones: observacionesFinal || null,
        veterinario_id: Number(veterinarioId)
    };

    try {
        const respuesta = await fetch(`${URL_API}/api/vacunas`, {
            method: "POST",
            headers: obtenerEncabezados(true),
            body: JSON.stringify(datosVacuna)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo registrar la vacuna.");
        }

        alert("Vacuna registrada correctamente.");
        limpiarFormVacuna();
        formVacuna.style.display = "none";
        btnToggleFormVacuna.textContent = "+ Registrar vacuna";

        await cargarVacunas(mascotaId);

    } catch (error) {
        console.error("Error al registrar vacuna:", error);
        alert(error.message || "Ocurrió un error al registrar la vacuna.");
    }
}

function limpiarFormVacuna() {
    formVacuna.reset();
    formVacuna.querySelectorAll(".form-group").forEach((fg) => {
        fg.classList.remove("error");
        const em = fg.querySelector(".error-msg");
        if (em) em.textContent = "";
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
    configurarModalHistorial();
    configurarFiltrosConsultas();
    configurarBotonVacunacion();
    configurarModalCartilla();
    cargarMascotas();
});