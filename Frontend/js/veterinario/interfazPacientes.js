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

const btnEditarHistorial = document.getElementById("btn-editar-historial");
const tituloModalHistorial = document.getElementById("titulo-modal-historial");
const btnSubmitHistorial = document.getElementById("btn-submit-historial");
const tituloModalConsulta = document.getElementById("titulo-modal-consulta");
const btnSubmitConsulta = document.getElementById("btn-submit-consulta");

const btnEliminarHistorial = document.getElementById("btn-eliminar-historial");

const modalConfirmacion = document.getElementById("modal-confirmacion");
const btnCerrarModalConfirmacion = document.getElementById("cerrar-modal-confirmacion");
const btnCancelarConfirmacion = document.getElementById("cancelar-confirmacion");
const btnConfirmarEliminacion = document.getElementById("confirmar-eliminacion");
const tituloConfirmacion = document.getElementById("titulo-confirmacion");
const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");

// Datos en memoria
let mascotas = [];
let consultasHistorialActual = [];
let vacunasActuales = [];
let mascotaCartillaActual = null;
let alertasPorMascota = {};
let alertasVacunasCompletas = [];
let notifiedVaccineIds = new Set();
let historialActualId = null;
let mascotaActual = null;
let historialActual = null;

let modoHistorial = "crear";
let modoConsulta = "crear";
let consultaActualId = null;

let tipoEliminacion = null;
let idEliminacion = null;

// ============================================================
// Notificaciones
// ============================================================

function mostrarNotificacion(mensaje) {
    const texto = String(mensaje).toLowerCase();
    let tipo = "info";

    if (texto.includes("correctamente")) {
        tipo = "success";
    } else if (
        texto.includes("error") ||
        texto.includes("no se pudo") ||
        texto.includes("ocurrió") ||
        texto.includes("ocurrio")
    ) {
        tipo = "error";
    }

    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);
    toast.textContent = mensaje;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.3s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 320);
    }, 3500);
}

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
        const [respuesta] = await Promise.all([
            fetch(`${URL_API}/api/mascotas`, {
                method: "GET",
                headers: obtenerEncabezados()
            }),
            cargarAlertasVacunasTabla()
        ]);

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
            <td data-label="Nombre" style="text-align: center;">${escapeHtml(mascota.Nombre)}</td>
            <td data-label="Especie" style="text-align: center;">${escapeHtml(mascota.Nombre_Especie)}</td>
            <td data-label="Raza" style="text-align: center;">${escapeHtml(mascota.Nombre_Raza)}</td>
            <td data-label="Peso (lbs)" style="text-align: center;">${formatearPeso(mascota.Peso)}</td>
            <td data-label="Nacimiento" style="text-align: center;">${formatearFecha(mascota.Fecha_Nacimiento)}</td>
            <td data-label="Propietario" style="text-align: center;">${escapeHtml(mascota.Propietario)}</td>
            <td data-label="Acciones" style="text-align: center;">
                <button 
                    type="button"
                    class="btn-accion btn-historial"
                    data-id="${mascota.Id}">
                    Historial clínico
                </button>

                <button
                    type="button"
                    class="btn-accion btn-vacunacion"
                    data-id="${mascota.Id}"
                    data-nombre="${escapeHtml(mascota.Nombre ?? "")}">
                    Cartilla de vacunación
                    ${alertasPorMascota[String(mascota.Id)] === "vencida"
                        ? '<span class="badge-alerta-vacuna vencida" title="Vacuna vencida">!</span>'
                        : alertasPorMascota[String(mascota.Id)] === "proxima"
                        ? '<span class="badge-alerta-vacuna" title="Vacuna próxima a vencer">!</span>'
                        : ""}
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
            mostrarNotificacion("No se encontró la información de la mascota seleccionada.");
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
    modoHistorial = "crear";
    historialActual = null;
    historialActualId = null;

    limpiarFormularioHistorial();

    tituloModalHistorial.textContent = "Crear historial clínico";
    btnSubmitHistorial.textContent = "Guardar historial";

    inputMascotaIdHistorial.value = mascota.Id;
    inputMascotaNombreHistorial.value = mascota.Nombre || "";

    modalHistorial.classList.add("show");
}

function abrirModalEditarHistorial() {
    if (!historialActual || !historialActualId || !mascotaActual) {
        mostrarNotificacion("No se encontró el historial clínico seleccionado.");
        return;
    }

    modoHistorial = "editar";

    limpiarFormularioHistorial();

    tituloModalHistorial.textContent = "Editar historial clínico";
    btnSubmitHistorial.textContent = "Actualizar historial";

    inputMascotaIdHistorial.value = mascotaActual.Id || historialActual.mascota_id || "";
    inputMascotaNombreHistorial.value = mascotaActual.Nombre || historialActual.mascota_nombre || "";

    inputMotivo.value = historialActual.motivo || historialActual.Motivo || "";
    inputDiagnosticoInicial.value = historialActual.diagnostico_inicial || historialActual.Diagnostico_Inicial || "";
    inputObservaciones.value = historialActual.observaciones || historialActual.Observaciones || "";

    modalDetalleHistorial.classList.remove("show");
    modalHistorial.classList.add("show");
}

async function abrirModalDetalleHistorial(mascota, historial) {
    limpiarDetalleHistorial();

    mascotaActual = mascota;
    historialActual = historial;

    detalleMascotaNombre.textContent = mascota.Nombre || historial.mascota_nombre || "-";
    detalleMascotaEspecie.textContent = mascota.Nombre_Especie || "-";
    detalleMascotaRaza.textContent = mascota.Nombre_Raza || "-";
    detalleMascotaPropietario.textContent = mascota.Propietario || "-";

    detalleMotivo.textContent = historial.motivo || historial.Motivo || "-";
    detalleDiagnosticoInicial.textContent = historial.diagnostico_inicial || historial.Diagnostico_Inicial || "-";
    detalleObservaciones.textContent = historial.observaciones || historial.Observaciones || "-";

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

// ============================================================
// Consultas médicas
// ============================================================

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
            const fechaA = obtenerFechaOrdenable(obtenerFechaConsulta(a));
            const fechaB = obtenerFechaOrdenable(obtenerFechaConsulta(b));

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

        const consultaId = consulta.id || consulta.Id || consulta.consulta_id || consulta.ConsultaId;

        const fechaConsulta = obtenerFechaConsulta(consulta);
        const sintomas = consulta.sintomas || consulta.Sintomas || "-";
        const diagnostico = consulta.diagnostico || consulta.Diagnostico || "-";
        const tratamiento = consulta.tratamiento || consulta.Tratamiento || "-";
        const observaciones = consulta.observaciones || consulta.Observaciones || "-";

        item.innerHTML = `
            <div class="consulta-header">
                <h4>Consulta del ${formatearFechaHora(fechaConsulta)}</h4>

                <div class="consulta-actions">
                    <button 
                        type="button" 
                        class="btn-editar-consulta"
                        data-id="${consultaId}">
                        Editar
                    </button>

                    <button 
                        type="button" 
                        class="btn-eliminar-consulta"
                        data-id="${consultaId}">
                        Eliminar
                    </button>
                </div>
            </div>

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
        mostrarNotificacion("No se encontró el historial clínico seleccionado.");
        return;
    }

    modoConsulta = "crear";
    consultaActualId = null;

    limpiarFormularioConsulta();

    tituloModalConsulta.textContent = "Agregar consulta médica";
    btnSubmitConsulta.textContent = "Guardar consulta";

    inputConsultaHistorialId.value = historialActualId;

    if (inputConsultaFecha) {
        inputConsultaFecha.value = "";
        inputConsultaFecha.disabled = true;
        inputConsultaFecha.required = false;
        inputConsultaFecha.placeholder = "Se asignará automáticamente";
    }

    modalConsulta.classList.add("show");
}

function abrirModalEditarConsulta(consulta) {
    if (!consulta) {
        mostrarNotificacion("No se encontró la consulta seleccionada.");
        return;
    }

    modoConsulta = "editar";
    consultaActualId = consulta.id || consulta.Id || consulta.consulta_id || consulta.ConsultaId;

    limpiarFormularioConsulta();

    tituloModalConsulta.textContent = "Editar consulta médica";
    btnSubmitConsulta.textContent = "Actualizar consulta";

    inputConsultaHistorialId.value = historialActualId || "";

    if (inputConsultaFecha) {
        inputConsultaFecha.value = convertirFechaParaInput(obtenerFechaConsulta(consulta));
        inputConsultaFecha.disabled = true;
        inputConsultaFecha.required = false;
    }

    inputConsultaSintomas.value = consulta.sintomas || consulta.Sintomas || "";
    inputConsultaDiagnostico.value = consulta.diagnostico || consulta.Diagnostico || "";
    inputConsultaTratamiento.value = consulta.tratamiento || consulta.Tratamiento || "";
    inputConsultaObservaciones.value = consulta.observaciones || consulta.Observaciones || "";

    modalConsulta.classList.add("show");
}

function cerrarModalConsulta() {
    modalConsulta.classList.remove("show");
    limpiarFormularioConsulta();

    if (inputConsultaFecha) {
        inputConsultaFecha.disabled = false;
        inputConsultaFecha.required = false;
    }

    modoConsulta = "crear";
    consultaActualId = null;

    tituloModalConsulta.textContent = "Agregar consulta médica";
    btnSubmitConsulta.textContent = "Guardar consulta";
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

    listaConsultas.addEventListener("click", (e) => {
        const botonEliminar = e.target.closest(".btn-eliminar-consulta");

        if (botonEliminar) {
            const consultaId = botonEliminar.dataset.id;
            abrirConfirmacionEliminar("consulta", consultaId);
            return;
        }

        const botonEditar = e.target.closest(".btn-editar-consulta");

        if (!botonEditar) return;

        const consultaId = botonEditar.dataset.id;

        const consultaSeleccionada = consultasHistorialActual.find((consulta) => {
            const id = consulta.id || consulta.Id || consulta.consulta_id || consulta.ConsultaId;
            return String(id) === String(consultaId);
        });

        abrirModalEditarConsulta(consultaSeleccionada);
    });

    formConsulta.addEventListener("submit", guardarConsultaMedica);
}

async function guardarConsultaMedica(e) {
    e.preventDefault();

    const historialId = inputConsultaHistorialId.value;
    const sintomas = inputConsultaSintomas.value.trim();
    const diagnostico = inputConsultaDiagnostico.value.trim();
    const tratamiento = inputConsultaTratamiento.value.trim();
    const observaciones = inputConsultaObservaciones.value.trim();

    const formularioValido = validarFormularioConsulta({
        sintomas,
        diagnostico,
        tratamiento,
        observaciones
    });

    if (!formularioValido) return;

    if (modoConsulta === "editar") {
        await actualizarConsultaMedica({
            sintomas,
            diagnostico,
            tratamiento,
            observaciones
        });

        return;
    }

    const veterinarioId = obtenerVeterinarioId();

    if (!veterinarioId) {
        mostrarNotificacion("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    const datosConsulta = {
        historial_id: Number(historialId),
        fecha: obtenerFechaActualParaApi(),
        sintomas,
        diagnostico,
        tratamiento,
        observaciones,
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

        mostrarNotificacion("Consulta médica registrada correctamente.");

        cerrarModalConsulta();

        await cargarConsultasHistorial(Number(historialId));

    } catch (error) {
        console.error("Error al registrar consulta médica:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al registrar la consulta médica.");
    }
}

async function actualizarConsultaMedica(datos) {
    if (!consultaActualId) {
        mostrarNotificacion("No se encontró la consulta médica a actualizar.");
        return;
    }

    const datosConsulta = {
        sintomas: datos.sintomas,
        diagnostico: datos.diagnostico,
        tratamiento: datos.tratamiento,
        observaciones: datos.observaciones
    };

    try {
        const respuesta = await fetch(`${URL_API}/api/historial/consultas/${consultaActualId}`, {
            method: "PUT",
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
            throw new Error(resultado.message || "No se pudo actualizar la consulta médica.");
        }

        mostrarNotificacion("Consulta médica actualizada correctamente.");

        cerrarModalConsulta();

        if (historialActualId) {
            await cargarConsultasHistorial(historialActualId);
        }

    } catch (error) {
        console.error("Error al actualizar consulta médica:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al actualizar la consulta médica.");
    }
}

// ============================================================
// Confirmación y eliminación
// ============================================================

function abrirConfirmacionEliminar(tipo, id) {
    tipoEliminacion = tipo;
    idEliminacion = id;

    if (tipo === "historial") {
        tituloConfirmacion.textContent = "Eliminar historial clínico";
        mensajeConfirmacion.textContent = "¿Está seguro de eliminar el historial clínico de esta mascota? Esta acción ocultará el historial registrado.";
    }

    if (tipo === "consulta") {
        tituloConfirmacion.textContent = "Eliminar consulta médica";
        mensajeConfirmacion.textContent = "¿Está seguro de eliminar esta consulta médica del historial clínico?";
    }

    if (tipo === "vacuna") {
        tituloConfirmacion.textContent = "Eliminar vacuna";
        mensajeConfirmacion.textContent = "¿Está seguro de eliminar este registro de vacuna? Esta acción no se puede deshacer.";
    }

    modalConfirmacion.classList.add("show");
}

function cerrarConfirmacionEliminar() {
    modalConfirmacion.classList.remove("show");

    tipoEliminacion = null;
    idEliminacion = null;

    tituloConfirmacion.textContent = "Confirmar eliminación";
    mensajeConfirmacion.textContent = "¿Está seguro de eliminar este registro?";
}

async function confirmarEliminacionRegistro() {
    if (!tipoEliminacion || !idEliminacion) {
        mostrarNotificacion("No se encontró el registro a eliminar.");
        return;
    }

    if (tipoEliminacion === "historial") {
        await eliminarHistorialClinico(idEliminacion);
        return;
    }

    if (tipoEliminacion === "consulta") {
        await eliminarConsultaMedica(idEliminacion);
        return;
    }

    if (tipoEliminacion === "vacuna") {
        await eliminarVacuna(idEliminacion);
    }
}

async function eliminarHistorialClinico(historialId) {
    try {
        const respuesta = await fetch(`${URL_API}/api/historial/${historialId}`, {
            method: "DELETE",
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
            throw new Error(resultado.message || "No se pudo eliminar el historial clínico.");
        }

        mostrarNotificacion("Historial clínico eliminado correctamente.");

        cerrarConfirmacionEliminar();
        cerrarModalDetalleHistorial();

    } catch (error) {
        console.error("Error al eliminar historial clínico:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al eliminar el historial clínico.");
    }
}

async function eliminarConsultaMedica(consultaId) {
    try {
        const respuesta = await fetch(`${URL_API}/api/historial/consultas/${consultaId}`, {
            method: "DELETE",
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
            throw new Error(resultado.message || "No se pudo eliminar la consulta médica.");
        }

        mostrarNotificacion("Consulta médica eliminada correctamente.");

        consultasHistorialActual = consultasHistorialActual.filter((consulta) => {
            const id = consulta.id || consulta.Id || consulta.consulta_id || consulta.ConsultaId;
            return String(id) !== String(consultaId);
        });

        renderizarConsultas(consultasHistorialActual);
        cerrarConfirmacionEliminar();

    } catch (error) {
        console.error("Error al eliminar consulta médica:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al eliminar la consulta médica.");
    }
}

async function eliminarVacuna(vacunaId) {
    try {
        const respuesta = await fetch(`${URL_API}/api/vacunas/${vacunaId}`, {
            method: "DELETE",
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
            throw new Error(resultado.message || "No se pudo eliminar la vacuna.");
        }

        mostrarNotificacion("Vacuna eliminada correctamente.");
        cerrarConfirmacionEliminar();

        if (mascotaCartillaActual) {
            await cargarVacunas(mascotaCartillaActual.Id);
        }

    } catch (error) {
        console.error("Error al eliminar vacuna:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al eliminar la vacuna.");
    }
}

function configurarModalConfirmacion() {
    btnCerrarModalConfirmacion.addEventListener("click", cerrarConfirmacionEliminar);
    btnCancelarConfirmacion.addEventListener("click", cerrarConfirmacionEliminar);
    btnConfirmarEliminacion.addEventListener("click", confirmarEliminacionRegistro);

    modalConfirmacion.addEventListener("click", (e) => {
        if (e.target === modalConfirmacion) {
            cerrarConfirmacionEliminar();
        }
    });
}

// ============================================================
// Filtros
// ============================================================

function configurarFiltrosConsultas() {
    if (!filtroFechaConsulta || !btnLimpiarFiltroConsultas) return;

    filtroFechaConsulta.addEventListener("change", () => {
        const fechaFiltro = filtroFechaConsulta.value;

        if (!fechaFiltro) {
            renderizarConsultas(consultasHistorialActual);
            return;
        }

        const consultasFiltradas = consultasHistorialActual.filter((consulta) => {
            const fechaConsulta = obtenerFechaConsulta(consulta);

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

// ============================================================
// Modal historial
// ============================================================

function cerrarModalCrearHistorial() {
    modalHistorial.classList.remove("show");
    limpiarFormularioHistorial();

    modoHistorial = "crear";

    tituloModalHistorial.textContent = "Crear historial clínico";
    btnSubmitHistorial.textContent = "Guardar historial";

    if (historialActual && mascotaActual && !modalDetalleHistorial.classList.contains("show")) {
        modalDetalleHistorial.classList.add("show");
    }
}

function limpiarFormularioHistorial() {
    formHistorial.reset();
    limpiarErroresFormulario();
}

function configurarModalHistorial() {
    btnCerrarModalHistorial.addEventListener("click", cerrarModalCrearHistorial);
    btnCancelarHistorial.addEventListener("click", cerrarModalCrearHistorial);

    btnCerrarModalDetalleHistorial.addEventListener("click", cerrarModalDetalleHistorial);
    btnEditarHistorial.addEventListener("click", abrirModalEditarHistorial);

    btnEliminarHistorial.addEventListener("click", () => {
        if (!historialActualId) {
            mostrarNotificacion("No se encontró el historial clínico seleccionado.");
            return;
        }

        abrirConfirmacionEliminar("historial", historialActualId);
    });

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

        if (e.key === "Escape" && modalConfirmacion.classList.contains("show")) {
            cerrarConfirmacionEliminar();
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

    if (modoHistorial === "editar") {
        await actualizarHistorialClinico({
            motivo,
            diagnosticoInicial,
            observaciones
        });

        return;
    }

    const veterinarioId = obtenerVeterinarioId();

    if (!veterinarioId) {
        mostrarNotificacion("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    const datosHistorial = {
        mascota_id: Number(mascotaId),
        motivo,
        diagnostico_inicial: diagnosticoInicial,
        observaciones,
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

        mostrarNotificacion("Historial clínico creado correctamente.");
        cerrarModalCrearHistorial();

    } catch (error) {
        console.error("Error al crear historial clínico:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al crear el historial clínico.");
    }
}

async function actualizarHistorialClinico(datos) {
    if (!historialActualId) {
        mostrarNotificacion("No se encontró el historial clínico a actualizar.");
        return;
    }

    const datosHistorial = {
        motivo: datos.motivo,
        diagnostico_inicial: datos.diagnosticoInicial,
        observaciones: datos.observaciones
    };

    try {
        const respuesta = await fetch(`${URL_API}/api/historial/${historialActualId}`, {
            method: "PUT",
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
            throw new Error(resultado.message || "No se pudo actualizar el historial clínico.");
        }

        mostrarNotificacion("Historial clínico actualizado correctamente.");

        modalHistorial.classList.remove("show");
        limpiarFormularioHistorial();

        modoHistorial = "crear";
        tituloModalHistorial.textContent = "Crear historial clínico";
        btnSubmitHistorial.textContent = "Guardar historial";

        if (mascotaActual) {
            await verificarHistorialMascota(mascotaActual);
        }

    } catch (error) {
        console.error("Error al actualizar historial clínico:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al actualizar el historial clínico.");
    }
}

// ============================================================
// Validaciones
// ============================================================

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

function validarFormularioConsulta(datos) {
    limpiarErroresFormularioConsulta();

    let valido = true;

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

// ============================================================
// Cartilla de vacunación
// ============================================================

async function cargarAlertasVacunasTabla() {
    try {
        const respuesta = await fetch(`${URL_API}/api/vacunas/alertas`, {
            method: "GET",
            headers: obtenerEncabezados()
        });

        if (!respuesta.ok) {
            console.warn("No se pudieron cargar las alertas de vacunas.");
            return;
        }

        const resultado = await respuesta.json();
        const alertas = Array.isArray(resultado.data) ? resultado.data : [];

        alertasVacunasCompletas = alertas.filter((a) => !notifiedVaccineIds.has(String(a.id)));
        alertasPorMascota = {};
        alertas.forEach((a) => {
            const mid = String(a.mascota_id);
            const estadoActual = alertasPorMascota[mid];
            const nuevoEstado = a.estado_alerta || "proxima";
            if (!estadoActual || nuevoEstado === "vencida") {
                alertasPorMascota[mid] = nuevoEstado;
            }
        });

        renderizarPanelAlertas();

    } catch (error) {
        console.warn("Error al cargar alertas de vacunas:", error);
    }
}

async function refrescarBadgesTabla() {
    await cargarAlertasVacunasTabla();
    renderizarMascotas(mascotas);
}

function renderizarPanelAlertas() {
    const lista = document.getElementById("alertas-panel-lista");
    const emptyMsg = document.getElementById("alertas-panel-empty");
    const countBadge = document.getElementById("alertas-count-badge");

    if (!lista) return;

    lista.innerHTML = "";

    if (alertasVacunasCompletas.length === 0) {
        emptyMsg.style.display = "block";
        countBadge.textContent = "";
        return;
    }

    emptyMsg.style.display = "none";
    countBadge.textContent = alertasVacunasCompletas.length;

    const ordenadas = [...alertasVacunasCompletas].sort((a, b) => {
        if (a.estado_alerta === "vencida" && b.estado_alerta !== "vencida") return -1;
        if (a.estado_alerta !== "vencida" && b.estado_alerta === "vencida") return 1;
        return (Number(a.dias_restantes) || 0) - (Number(b.dias_restantes) || 0);
    });

    ordenadas.forEach((alerta) => {
        const esVencida = alerta.estado_alerta === "vencida";
        const dias = Math.abs(Number(alerta.dias_restantes) || 0);

        let textoFecha;
        if (esVencida) {
            textoFecha = dias === 0 ? "Venció hoy" : `Venció hace ${dias} día${dias !== 1 ? "s" : ""}`;
        } else {
            textoFecha = dias === 0 ? "Vence hoy" : `Vence en ${dias} día${dias !== 1 ? "s" : ""}`;
        }

        const item = document.createElement("div");
        item.classList.add("alerta-panel-item");
        if (esVencida) item.classList.add("vencida");
        item.dataset.mascotaId = alerta.mascota_id;
        item.title = "Clic para abrir cartilla de vacunación";

        item.innerHTML = `
            <div class="alerta-panel-info">
                <span class="alerta-panel-mascota">${escapeHtml(alerta.mascota_nombre || "-")}</span>
                <span class="alerta-panel-sep">·</span>
                <span class="alerta-panel-vacuna">${escapeHtml(alerta.nombre_vacuna || "-")}</span>
                <span class="alerta-panel-sep">·</span>
                <span class="alerta-panel-fecha">${textoFecha}</span>
            </div>
            <span class="alerta-panel-badge ${esVencida ? "vencida" : "proxima"}">${esVencida ? "Vencida" : "Próxima"}</span>
        `;

        lista.appendChild(item);
    });
}

function configurarPanelAlertas() {
    const panel = document.getElementById("alertas-panel");
    const header = document.getElementById("btn-toggle-alertas-panel");
    const lista = document.getElementById("alertas-panel-lista");

    if (!panel || !header) return;

    if (window.innerWidth <= 600) {
        panel.classList.add("collapsed");
    }

    header.addEventListener("click", () => {
        panel.classList.toggle("collapsed");
    });

    lista.addEventListener("click", (e) => {
        const item = e.target.closest(".alerta-panel-item");
        if (!item) return;
        const mascotaId = item.dataset.mascotaId;
        const mascota = mascotas.find((m) => String(m.Id) === String(mascotaId));
        if (mascota) abrirModalCartilla(mascota);
    });
}

function configurarBotonVacunacion() {
    tbody.addEventListener("click", async (e) => {
        const boton = e.target.closest(".btn-vacunacion");
        if (!boton) return;

        const mascotaId = boton.dataset.id;
        const mascotaSeleccionada = mascotas.find((m) => String(m.Id) === String(mascotaId));

        if (!mascotaSeleccionada) {
            mostrarNotificacion("No se encontró la información de la mascota seleccionada.");
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
            <div class="vacuna-acciones">
                <span class="vacuna-badge ${estado}">${etiquetas[estado] || estado}</span>
                <button type="button" class="btn-eliminar-vacuna" data-id="${vacuna.id}">Eliminar</button>
            </div>
        `;

        lista.appendChild(item);
    });
}

function renderizarAlertas(vacunas) {
    const lista = document.getElementById("cartilla-alertas-lista");
    const emptyAlertas = document.getElementById("cartilla-alertas-empty");

    lista.innerHTML = "";

    const alertas = vacunas.filter((v) =>
        (v.estado_vacuna === "vencida" || v.estado_vacuna === "proxima") &&
        !notifiedVaccineIds.has(String(v.id))
    );

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
            <div class="alerta-info">
                <p><strong>${escapeHtml(vacuna.nombre_vacuna)}</strong> — ${esVencida ? "Vacuna vencida" : "Próxima dosis"}</p>
                <p>Fecha próxima dosis: <strong>${fechaProxima}</strong></p>
            </div>
            <div class="alerta-acciones">
                <button type="button" class="btn-alerta-notificar" data-id="${vacuna.id}">
                    Marcar como revisada
                </button>
            </div>
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

    document.getElementById("cartilla-vacunas-lista").addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-eliminar-vacuna");
        if (!boton) return;
        abrirConfirmacionEliminar("vacuna", boton.dataset.id);
    });

    document.getElementById("cartilla-alertas-lista").addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-alerta-notificar");
        if (!boton) return;
        const item = boton.closest(".alerta-item");
        marcarNotificacionVacuna(boton.dataset.id, item);
    });
}

async function marcarNotificacionVacuna(vacunaId, itemElement) {

    try {
        const respuesta = await fetch(`${URL_API}/api/vacunas/${vacunaId}/notificar`, {
            method: "POST",
            headers: obtenerEncabezados(true),
            // ✅ Body vacío — el backend ya no necesita propietario_id
            body: JSON.stringify({})
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo marcar la notificación.");
        }

        notifiedVaccineIds.add(String(vacunaId));
        itemElement?.remove();

        const lista = document.getElementById("cartilla-alertas-lista");
        const emptyAlertas = document.getElementById("cartilla-alertas-empty");
        if (lista && lista.children.length === 0) {
            emptyAlertas.style.display = "block";
        }

        await refrescarBadgesTabla();

        mostrarNotificacion("Notificación marcada como revisada.");

    } catch (error) {
        console.error("Error al marcar notificación:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al marcar la notificación.");
    }
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

    // Referencias a los campos
    const inputNombreV = document.getElementById("vacuna-nombre");
    const inputFechaV = document.getElementById("vacuna-fecha");
    const inputPeso = document.getElementById("vacuna-peso");
    const inputProxima = document.getElementById("vacuna-proxima");
    const inputLote = document.getElementById("vacuna-lote");

    // Limpiar errores previos
    [inputNombreV, inputFechaV, inputPeso, inputProxima, inputLote].forEach((inp) => {
        if (!inp) return;
        const fg = inp.closest(".form-group");
        if (fg) {
            fg.classList.remove("error");
            const em = fg.querySelector(".error-msg");
            if (em) em.textContent = "";
        }
    });

    let valido = true;

    // Validar nombre de vacuna (requerido)
    if (!nombreVacuna) {
        const fg = inputNombreV.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "El nombre de la vacuna es obligatorio.";
        valido = false;
    }

    // Validar fecha de aplicación (requerido)
    if (!fechaAplicacion) {
        const fg = inputFechaV.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "La fecha de aplicación es obligatoria.";
        valido = false;
    }

    // Validar peso del paciente (requerido)
    if (!pesoInput) {
        const fg = inputPeso.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "El peso del paciente es obligatorio.";
        valido = false;
    }

    // Validar lote (requerido)
    if (!lote) {
        const fg = inputLote.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "El número de lote es obligatorio.";
        valido = false;
    }

    // Validar próxima dosis (requerido)
    if (!proximaDosis) {
        const fg = inputProxima.closest(".form-group");
        fg.classList.add("error");
        fg.querySelector(".error-msg").textContent = "La fecha de próxima dosis es obligatoria.";
        valido = false;
    }

    if (!valido) return;

    const veterinarioId = obtenerVeterinarioId();
    if (!veterinarioId) {
        mostrarNotificacion("No se encontró el ID del veterinario en la sesión.");
        return;
    }

    // Observaciones es opcional, se incluye solo si tiene valor
    let observacionesFinal = null;
    if (observacionesInput) {
        observacionesFinal = pesoInput
            ? `Peso: ${pesoInput} lbs. ${observacionesInput}`
            : observacionesInput;
    } else if (pesoInput) {
        observacionesFinal = `Peso: ${pesoInput} lbs.`;
    }

    const datosVacuna = {
        mascota_id: Number(mascotaId),
        nombre_vacuna: nombreVacuna,
        fecha_aplicacion: fechaAplicacion,
        proxima_dosis: proximaDosis,
        lote: lote,
        observaciones: observacionesFinal,
        veterinario_id: Number(veterinarioId),
        peso_lbs: parseFloat(pesoInput)
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

        mostrarNotificacion("Vacuna registrada correctamente.");
        limpiarFormVacuna();
        formVacuna.style.display = "none";
        btnToggleFormVacuna.textContent = "+ Registrar vacuna";

        await cargarVacunas(mascotaId);

    } catch (error) {
        console.error("Error al registrar vacuna:", error);
        mostrarNotificacion(error.message || "Ocurrió un error al registrar la vacuna.");
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

function obtenerFechaConsulta(consulta) {
    return consulta.fecha
        || consulta.Fecha
        || consulta.fecha_consulta
        || consulta.Fecha_Consulta
        || consulta.fecha_hora
        || consulta.FechaHora
        || consulta.Fecha_Hora
        || "";
}

function obtenerFechaActualParaApi() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const hora = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
}

function normalizarFechaParaApi(fechaInput) {
    if (!fechaInput) return "";

    const fechaLimpia = String(fechaInput).trim();

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaLimpia)) {
        return `${fechaLimpia}:00`;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fechaLimpia)) {
        return fechaLimpia;
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fechaLimpia)) {
        return fechaLimpia.replace(" ", "T");
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(fechaLimpia)) {
        return `${fechaLimpia.replace(" ", "T")}:00`;
    }

    return "";
}

/*
    IMPORTANTE:
    Tu backend/base de datos está devolviendo las consultas con un desfase de +12 horas.
    Ejemplo:
    - Hora real: 23/05/2026 14:57
    - Hora recibida: 24/05/2026 02:57

    Esta función corrige ese desfase SOLO al mostrar, filtrar y ordenar las consultas.
    Cuando arreglen la zona horaria en backend/MySQL, quitá esta línea:
    fechaObj.setHours(fechaObj.getHours() - 12);
*/
function ajustarFechaConsulta(fecha) {
    if (!fecha) return null;

    const fechaTexto = String(fecha).trim();

    // Normalizamos la fecha para trabajarla manualmente
    // y evitar que JavaScript aplique zona horaria automáticamente.
    const fechaLimpia = fechaTexto
        .replace(" ", "T")
        .replace("Z", "");

    const partes = fechaLimpia.split("T");

    if (partes.length < 2) return null;

    const fechaParte = partes[0];
    const horaParte = partes[1];

    const partesFecha = fechaParte.split("-");
    const partesHora = horaParte.split(":");

    if (partesFecha.length !== 3 || partesHora.length < 2) {
        return null;
    }

    const anio = Number(partesFecha[0]);
    const mes = Number(partesFecha[1]) - 1;
    const dia = Number(partesFecha[2]);

    const hora = Number(partesHora[0]);
    const minutos = Number(partesHora[1]);
    const segundos = Number(partesHora[2]?.split(".")[0] || 0);

    if (
        isNaN(anio) ||
        isNaN(mes) ||
        isNaN(dia) ||
        isNaN(hora) ||
        isNaN(minutos) ||
        isNaN(segundos)
    ) {
        return null;
    }

    // Creamos la fecha como hora local, NO como UTC.
    const fechaObj = new Date(anio, mes, dia, hora, minutos, segundos);

    // Corrección temporal por desfase de backend/MySQL:
    // La fecha está viniendo 12 horas adelantada.
    fechaObj.setHours(fechaObj.getHours() - 12);

    return fechaObj;
}

function convertirFechaParaInput(fecha) {
    const fechaObj = ajustarFechaConsulta(fecha);

    if (!fechaObj) return "";

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const hora = String(fechaObj.getHours()).padStart(2, "0");
    const minutos = String(fechaObj.getMinutes()).padStart(2, "0");

    return `${anio}-${mes}-${dia}T${hora}:${minutos}`;
}

function obtenerFechaOrdenable(fecha) {
    const fechaObj = ajustarFechaConsulta(fecha);

    if (!fechaObj) return 0;

    return fechaObj.getTime();
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaTexto = String(fecha).trim();

    const soloFecha = fechaTexto.split("T")[0].split(" ")[0];
    const partes = soloFecha.split("-");

    if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia}-${mes}-${anio}`;
    }

    return "";
}

function formatearFechaHora(fecha) {
    const fechaObj = ajustarFechaConsulta(fecha);

    if (!fechaObj) return "";

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();

    const hora = String(fechaObj.getHours()).padStart(2, "0");
    const minutos = String(fechaObj.getMinutes()).padStart(2, "0");

    return `${dia}-${mes}-${anio} ${hora}:${minutos}`;
}

function obtenerFechaInput(fecha) {
    const fechaObj = ajustarFechaConsulta(fecha);

    if (!fechaObj) return "";

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
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
// ICC (Índice de Condición Corporal)
// ============================================================
// ============================================================
// ICC (Índice de Condición Corporal) - VERSIÓN CORREGIDA
// ============================================================

// ============================================================
// ICC (Índice de Condición Corporal) - CON INFORMACIÓN DE MASCOTA
// ============================================================

// Elementos del DOM
const modalICC = document.getElementById("modal-icc");
const btnCerrarModalICC = document.getElementById("cerrar-modal-icc");
const btnICCHeader = document.getElementById("btn-icc-header");
const iccMascotaSelect = document.getElementById("icc-mascota-select");
const iccInfoMascota = document.getElementById("icc-info-mascota");
const iccMascotaNombre = document.getElementById("icc-mascota-nombre");
const iccMascotaEspecie = document.getElementById("icc-mascota-especie");
const iccMascotaPropietario = document.getElementById("icc-mascota-propietario");
const formICC = document.getElementById("form-icc");
const iccEspecieSelect = document.getElementById("icc-especie");
const iccTamanioSelect = document.getElementById("icc-tamanio");
const iccRangoSelect = document.getElementById("icc-rango");
const grupoTamanio = document.getElementById("grupo-tamanio");
const grupoRango = document.getElementById("grupo-rango");
const iccPesoInput = document.getElementById("icc-peso");
const iccResultadoDiv = document.getElementById("icc-resultado");
const iccPuntuacionSpan = document.getElementById("icc-puntuacion");
const iccCategoriaDiv = document.getElementById("icc-categoria");
const iccDescripcionDiv = document.getElementById("icc-descripcion");
const iccRecomendacionesDiv = document.getElementById("icc-recomendaciones");
const iccFechaCalculo = document.getElementById("icc-fecha-calculo");

let mascotaICCActual = null;
let iccCalculadoActual = null;

// ============================================================
// PESO IDEAL POR ESPECIE Y TAMAÑO (en kg)
// ============================================================

const pesosIdeales = {
    perro: { mini: 2.5, pequeno: 7, mediano: 18, grande: 35, gigante: 55 },
    gato: { pequeno: 3, mediano: 4.5, grande: 6 },
    conejo: { pequeno: 1.5, mediano: 2.2, grande: 3 },
    hamster: { pequeno: 0.05, mediano: 0.1, grande: 0.15 },
    cobaya: { pequeno: 0.8, mediano: 1.2, grande: 1.6 },
    rata: { pequeno: 0.3, mediano: 0.5, grande: 0.7 },
    raton: { pequeno: 0.02, mediano: 0.03, grande: 0.04 },
    erizo: { pequeno: 0.3, mediano: 0.5, grande: 0.7 },
    huron: { pequeno: 0.8, mediano: 1.2, grande: 1.8 },
    cerdo: { pequeno: 30, mediano: 60, grande: 100 },
    caballo: { pequeno: 200, mediano: 450, grande: 700 },
    vaca: { pequeno: 300, mediano: 500, grande: 800 },
    oveja: { pequeno: 40, mediano: 60, grande: 80 },
    cabra: { pequeno: 35, mediano: 55, grande: 75 },
    gallina: { pequeno: 1.5, mediano: 2.5, grande: 3.5 },
    pato: { pequeno: 2, mediano: 3, grande: 4 },
    loro: { pequeno: 0.3, mediano: 0.5, grande: 1 },
    tortuga: { pequeno: 1, mediano: 5, grande: 15 },
    iguana: { pequeno: 1, mediano: 3, grande: 6 },
    serpiente: { pequeno: 1, mediano: 5, grande: 20 },
    pez: { pequeno: 0.05, mediano: 0.2, grande: 0.5 },
    otro: { pequeno: 1, mediano: 5, grande: 10 }
};

// ============================================================
// CARGAR MASCOTAS EN EL SELECTOR
// ============================================================

function cargarMascotasEnSelector() {
    if (!iccMascotaSelect) return;
    
    iccMascotaSelect.innerHTML = '<option value="">-- Seleccione una mascota --</option>';
    
    if (mascotas && mascotas.length > 0) {
        mascotas.forEach((mascota) => {
            const option = document.createElement("option");
            option.value = mascota.Id;
            option.textContent = `${mascota.Nombre} - ${mascota.Propietario} (${mascota.Nombre_Especie || "Especie"})`;
            iccMascotaSelect.appendChild(option);
        });
    }
}

// ============================================================
// MOSTRAR INFORMACIÓN DE LA MASCOTA
// ============================================================
function configurarSelectorMascotas() {
    if (!iccMascotaSelect) return;
    
    iccMascotaSelect.addEventListener("change", function() {
        const mascotaId = this.value;
        
        if (!mascotaId) {
            iccInfoMascota.style.display = "none";
            mascotaICCActual = null;
            return;
        }
        
        const mascota = mascotas.find((m) => String(m.Id) === String(mascotaId));
        
        if (mascota) {
            mascotaICCActual = mascota;
            
            // Limpiar y mostrar información de forma ordenada
            iccMascotaNombre.textContent = mascota.Nombre || "-";
            
            // Especie y raza en una sola línea limpia
            const especieTexto = mascota.Nombre_Especie || "Especie";
            const razaTexto = mascota.Nombre_Raza || "Raza no especificada";
            iccMascotaEspecie.textContent = `${especieTexto} · ${razaTexto}`;
            
            // Propietario y peso en líneas separadas y más limpias
            const propietarioTexto = mascota.Propietario || "No registrado";
            const pesoTexto = mascota.Peso ? `${mascota.Peso} lbs` : "No registrado";
            
            iccMascotaPropietario.innerHTML = `
                <span>👤 Propietario: ${propietarioTexto}</span><br>
                <span>⚖️ Peso registrado: ${pesoTexto}</span>
            `;
            
            iccInfoMascota.style.display = "block";
        }
    });
}
// ============================================================
// CONFIGURAR CAMPOS POR ESPECIE
// ============================================================

function configurarCamposPorEspecie() {
    if (!iccEspecieSelect) return;
    
    iccEspecieSelect.addEventListener("change", function() {
        const especie = this.value;
        
        if (grupoTamanio) grupoTamanio.style.display = "none";
        if (grupoRango) grupoRango.style.display = "none";
        
        if (especie === "perro") {
            if (grupoTamanio) grupoTamanio.style.display = "block";
            if (iccTamanioSelect) iccTamanioSelect.value = "";
        } else if (especie !== "") {
            if (grupoRango) grupoRango.style.display = "block";
            if (iccRangoSelect) iccRangoSelect.value = "";
        }
    });
}

// ============================================================
// CALCULAR ICC
// ============================================================

function calcularICCManual(especie, tamanio, pesoLibras) {
    const pesoKg = pesoLibras * 0.453592;
    let pesoIdeal = 5;
    
    if (especie === "perro") {
        const tamaños = {
            mini: pesosIdeales.perro.mini,
            pequeno: pesosIdeales.perro.pequeno,
            mediano: pesosIdeales.perro.mediano,
            grande: pesosIdeales.perro.grande,
            gigante: pesosIdeales.perro.gigante
        };
        pesoIdeal = tamaños[tamanio] || pesosIdeales.perro.mediano;
    } else if (pesosIdeales[especie]) {
        const rangos = {
            pequeno: pesosIdeales[especie].pequeno,
            mediano: pesosIdeales[especie].mediano,
            grande: pesosIdeales[especie].grande
        };
        pesoIdeal = rangos[tamanio] || pesosIdeales[especie].mediano;
    }
    
    const porcentaje = pesoKg / pesoIdeal;
    let puntuacion = 5;
    
    if (porcentaje <= 0.5) puntuacion = 1;
    else if (porcentaje <= 0.6) puntuacion = 2;
    else if (porcentaje <= 0.7) puntuacion = 3;
    else if (porcentaje <= 0.85) puntuacion = 4;
    else if (porcentaje <= 1.15) puntuacion = 5;
    else if (porcentaje <= 1.3) puntuacion = 6;
    else if (porcentaje <= 1.5) puntuacion = 7;
    else if (porcentaje <= 1.8) puntuacion = 8;
    else puntuacion = 9;
    
    let categoria = "";
    if (puntuacion <= 2) categoria = "🔴 EMACIADO (Desnutrición severa)";
    else if (puntuacion <= 3) categoria = "🟠 MUY DELGADO";
    else if (puntuacion === 4) categoria = "🟡 DELGADO";
    else if (puntuacion === 5) categoria = "🟢 IDEAL - Peso saludable";
    else if (puntuacion === 6) categoria = "🟡 SOBREPESO LEVE";
    else if (puntuacion === 7) categoria = "🟠 SOBREPESO";
    else if (puntuacion === 8) categoria = "🔴 OBESO";
    else categoria = "⚫ OBESO MÓRBIDO";
    
    const estado = puntuacion === 5 ? "PESO IDEAL" :
                   puntuacion <= 3 ? "BAJO PESO SEVERO" :
                   puntuacion === 4 ? "LIGERAMENTE BAJO" :
                   puntuacion <= 6 ? "LIGERO SOBREPESO" :
                   puntuacion <= 7 ? "SOBREPESO" : "OBESIDAD";
    
    let descripcion = `🐾 Peso actual: ${pesoKg.toFixed(1)} kg | Peso ideal: ${pesoIdeal.toFixed(1)} kg\n`;
    descripcion += `📊 Estado: ${estado}\n`;
    descripcion += `📈 Porcentaje: ${((pesoKg / pesoIdeal) * 100).toFixed(0)}%\n\n`;
    
    if (puntuacion === 5) descripcion += "✅ El paciente se encuentra en su peso ideal.";
    else if (puntuacion <= 3) descripcion += "⚠️ Bajo peso severo. Requiere intervención urgente.";
    else if (puntuacion === 4) descripcion += "📈 Ligeramente bajo de peso. Aumentar alimentación.";
    else if (puntuacion <= 6) descripcion += "⚠️ Ligero sobrepeso. Monitorear alimentación.";
    else if (puntuacion <= 7) descripcion += "⚠️ Sobrepeso. Requiere control de porciones.";
    else descripcion += "🚨 Obesidad. Requiere intervención veterinaria urgente.";
    
    let recomendaciones = "";
    if (puntuacion <= 3) {
        recomendaciones = "🔴 RECOMENDACIONES URGENTES:\n✓ Consultar al veterinario INMEDIATAMENTE\n✓ Aumentar ración en 30-40%\n✓ Alimento de alta calidad\n✓ Desparasitar\n✓ Control de peso 2 veces por semana";
    } else if (puntuacion === 4) {
        recomendaciones = "🟡 RECOMENDACIONES:\n✓ Aumentar ración en 10-15%\n✓ Agregar snacks saludables\n✓ Control de peso quincenal";
    } else if (puntuacion === 5) {
        recomendaciones = "🟢 RECOMENDACIONES - MANTENER:\n✓ Dieta balanceada actual\n✓ Ejercicio regular diario\n✓ Control de peso mensual\n✓ Agua fresca siempre disponible";
    } else if (puntuacion === 6) {
        recomendaciones = "🟡 RECOMENDACIONES:\n✓ Reducir ración en 5-10%\n✓ Aumentar ejercicio diario\n✓ Reducir premios y golosinas";
    } else if (puntuacion === 7) {
        recomendaciones = "🟠 RECOMENDACIONES:\n✓ Reducir ración en 15-20%\n✓ Ejercicio intensivo diario\n✓ Eliminar premios calóricos\n✓ Dieta baja en grasas";
    } else {
        recomendaciones = "🔴 RECOMENDACIONES URGENTES:\n✓ Dieta estricta supervisada por veterinario\n✓ Programa de ejercicio diario\n✓ Evaluación metabólica completa\n✓ Prohibido dar premios\n✓ Control de peso semanal";
    }
    
    return { puntuacion, categoria, descripcion, recomendaciones, pesoKg, pesoLibras, pesoIdeal };
}

// ============================================================
// CALCULAR Y MOSTRAR
// ============================================================

function calcularYMostrarICC(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const especie = iccEspecieSelect ? iccEspecieSelect.value : "";
    if (!especie) {
        mostrarErrorCampoICC(iccEspecieSelect, "Seleccione una especie");
        return;
    }
    
    let tamanio = "";
    if (especie === "perro") {
        tamanio = iccTamanioSelect ? iccTamanioSelect.value : "";
        if (!tamanio) {
            mostrarErrorCampoICC(iccTamanioSelect, "Seleccione el tamaño del perro");
            return;
        }
    } else {
        tamanio = iccRangoSelect ? iccRangoSelect.value : "";
        if (!tamanio) {
            mostrarErrorCampoICC(iccRangoSelect, "Seleccione el rango de tamaño");
            return;
        }
    }
    
    if (!iccPesoInput || !iccPesoInput.value) {
        mostrarErrorCampoICC(iccPesoInput, "Ingrese el peso actual");
        return;
    }
    
    const peso = parseFloat(iccPesoInput.value);
    if (isNaN(peso) || peso <= 0) {
        mostrarErrorCampoICC(iccPesoInput, "Ingrese un peso válido");
        return;
    }
    
    const resultado = calcularICCManual(especie, tamanio, peso);
    iccCalculadoActual = resultado;
    
    if (iccPuntuacionSpan) iccPuntuacionSpan.textContent = resultado.puntuacion;
    
    if (iccCategoriaDiv) {
        iccCategoriaDiv.textContent = resultado.categoria;
        if (resultado.categoria.includes("IDEAL")) {
            iccCategoriaDiv.style.background = "#d4edda";
            iccCategoriaDiv.style.color = "#155724";
        } else if (resultado.categoria.includes("SOBREPESO") || resultado.categoria.includes("OBESO")) {
            iccCategoriaDiv.style.background = "#f8d7da";
            iccCategoriaDiv.style.color = "#721c24";
        } else {
            iccCategoriaDiv.style.background = "#fff3cd";
            iccCategoriaDiv.style.color = "#856404";
        }
    }
    
    if (iccDescripcionDiv) iccDescripcionDiv.innerHTML = resultado.descripcion.replace(/\n/g, '<br>');
    if (iccRecomendacionesDiv) iccRecomendacionesDiv.innerHTML = resultado.recomendaciones.replace(/\n/g, '<br>');
    
    if (iccFechaCalculo) {
        const ahora = new Date();
        iccFechaCalculo.textContent = `📅 ${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
    }
    
    if (iccResultadoDiv) {
        iccResultadoDiv.style.display = "block";
        iccResultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    mostrarNotificacion("✅ ICC calculado correctamente");
}

function mostrarErrorCampoICC(input, mensaje) {
    if (!input) return;
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;
    formGroup.classList.add("error");
    let errorMsg = formGroup.querySelector(".error-msg");
    if (!errorMsg) {
        errorMsg = document.createElement("small");
        errorMsg.className = "error-msg";
        formGroup.appendChild(errorMsg);
    }
    errorMsg.textContent = mensaje;
    setTimeout(() => {
        formGroup.classList.remove("error");
        if (errorMsg) errorMsg.textContent = "";
    }, 3000);
}

// ============================================================
// ABRIR Y CERRAR MODAL
// ============================================================

function abrirModalICC() {
    if (!mascotas || mascotas.length === 0) {
        mostrarNotificacion("❌ No hay mascotas registradas.");
        return;
    }
    
    cargarMascotasEnSelector();
    
    if (iccMascotaSelect) iccMascotaSelect.value = "";
    if (iccInfoMascota) iccInfoMascota.style.display = "none";
    if (iccResultadoDiv) iccResultadoDiv.style.display = "none";
    if (formICC) formICC.reset();
    if (grupoTamanio) grupoTamanio.style.display = "none";
    if (grupoRango) grupoRango.style.display = "none";
    
    mascotaICCActual = null;
    iccCalculadoActual = null;
    
    if (modalICC) modalICC.classList.add("show");
}

function cerrarModalICC() {
    if (modalICC) modalICC.classList.remove("show");
}

// ============================================================
// CONFIGURACIÓN PRINCIPAL
// ============================================================

function configurarModalICC() {
    if (!btnICCHeader) return;
    
    btnICCHeader.addEventListener("click", abrirModalICC);
    if (btnCerrarModalICC) btnCerrarModalICC.addEventListener("click", cerrarModalICC);
    
    if (modalICC) {
        modalICC.addEventListener("click", (e) => {
            if (e.target === modalICC) cerrarModalICC();
        });
    }
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalICC && modalICC.classList.contains("show")) {
            cerrarModalICC();
        }
    });
    
    configurarSelectorMascotas();
    configurarCamposPorEspecie();
    
    if (formICC) formICC.addEventListener("submit", calcularYMostrarICC);
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
    configurarModalConfirmacion();
    configurarFiltrosConsultas();
    configurarPanelAlertas();
    configurarBotonVacunacion();
    configurarModalCartilla();
    cargarMascotas();
    configurarModalICC();
});