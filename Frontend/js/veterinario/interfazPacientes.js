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
let historialActualId = null;
let mascotaActual = null;
let historialActual = null;

let modoHistorial = "crear";
let modoConsulta = "crear";
let consultaActualId = null;

let tipoEliminacion = null;
let idEliminacion = null;

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

                <button 
                    type="button" 
                    class="btn-accion btn-vacunacion" 
                    data-id="${mascota.Id}" 
                    data-nombre="${escapeHtml(mascota.Nombre ?? "")}">
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
        alert("No se encontró el historial clínico seleccionado.");
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
        alert("No se encontró el historial clínico seleccionado.");
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
        alert("No se encontró la consulta seleccionada.");
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
        alert("No se encontró el ID del veterinario en la sesión.");
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

        alert("Consulta médica registrada correctamente.");

        cerrarModalConsulta();

        await cargarConsultasHistorial(Number(historialId));

    } catch (error) {
        console.error("Error al registrar consulta médica:", error);
        alert(error.message || "Ocurrió un error al registrar la consulta médica.");
    }
}

async function actualizarConsultaMedica(datos) {
    if (!consultaActualId) {
        alert("No se encontró la consulta médica a actualizar.");
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

        alert("Consulta médica actualizada correctamente.");

        cerrarModalConsulta();

        if (historialActualId) {
            await cargarConsultasHistorial(historialActualId);
        }

    } catch (error) {
        console.error("Error al actualizar consulta médica:", error);
        alert(error.message || "Ocurrió un error al actualizar la consulta médica.");
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
        alert("No se encontró el registro a eliminar.");
        return;
    }

    if (tipoEliminacion === "historial") {
        await eliminarHistorialClinico(idEliminacion);
        return;
    }

    if (tipoEliminacion === "consulta") {
        await eliminarConsultaMedica(idEliminacion);
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

        alert("Historial clínico eliminado correctamente.");

        cerrarConfirmacionEliminar();
        cerrarModalDetalleHistorial();

    } catch (error) {
        console.error("Error al eliminar historial clínico:", error);
        alert(error.message || "Ocurrió un error al eliminar el historial clínico.");
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

        alert("Consulta médica eliminada correctamente.");

        consultasHistorialActual = consultasHistorialActual.filter((consulta) => {
            const id = consulta.id || consulta.Id || consulta.consulta_id || consulta.ConsultaId;
            return String(id) !== String(consultaId);
        });

        renderizarConsultas(consultasHistorialActual);
        cerrarConfirmacionEliminar();

    } catch (error) {
        console.error("Error al eliminar consulta médica:", error);
        alert(error.message || "Ocurrió un error al eliminar la consulta médica.");
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
            alert("No se encontró el historial clínico seleccionado.");
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
        alert("No se encontró el ID del veterinario en la sesión.");
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

        alert("Historial clínico creado correctamente.");
        cerrarModalCrearHistorial();

    } catch (error) {
        console.error("Error al crear historial clínico:", error);
        alert(error.message || "Ocurrió un error al crear el historial clínico.");
    }
}

async function actualizarHistorialClinico(datos) {
    if (!historialActualId) {
        alert("No se encontró el historial clínico a actualizar.");
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

        alert("Historial clínico actualizado correctamente.");

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
        alert(error.message || "Ocurrió un error al actualizar el historial clínico.");
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

function convertirFechaParaInput(fecha) {
    if (!fecha) return "";

    const fechaTexto = String(fecha).trim();

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(fechaTexto)) {
        return fechaTexto.slice(0, 16);
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(fechaTexto)) {
        const [fechaParte, horaParte] = fechaTexto.split(" ");
        return `${fechaParte}T${horaParte.slice(0, 5)}`;
    }

    return "";
}

function obtenerFechaOrdenable(fecha) {
    if (!fecha) return 0;

    const fechaNormalizada = String(fecha).replace(" ", "T");
    const fechaObj = new Date(fechaNormalizada);

    if (isNaN(fechaObj.getTime())) return 0;

    return fechaObj.getTime();
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaTexto = String(fecha);
    const soloFecha = fechaTexto.split("T")[0].split(" ")[0];
    const partes = soloFecha.split("-");

    if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia}-${mes}-${anio}`;
    }

    return "";
}

function formatearFechaHora(fecha) {
    if (!fecha) return "";

    const fechaTexto = String(fecha).trim();

    let fechaParte = "";
    let horaParte = "";

    if (fechaTexto.includes("T")) {
        const partes = fechaTexto.split("T");
        fechaParte = partes[0];
        horaParte = partes[1] || "";
    } else if (fechaTexto.includes(" ")) {
        const partes = fechaTexto.split(" ");
        fechaParte = partes[0];
        horaParte = partes[1] || "";
    } else {
        return formatearFecha(fechaTexto);
    }

    const partesFecha = fechaParte.split("-");

    if (partesFecha.length !== 3) {
        return formatearFecha(fechaTexto);
    }

    const [anio, mes, dia] = partesFecha;
    const horaCorta = horaParte.slice(0, 5);

    if (!horaCorta) {
        return `${dia}-${mes}-${anio}`;
    }

    return `${dia}-${mes}-${anio} ${horaCorta}`;
}

function obtenerFechaInput(fecha) {
    if (!fecha) return "";

    const fechaTexto = String(fecha);
    const soloFecha = fechaTexto.split("T")[0].split(" ")[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
        return soloFecha;
    }

    return "";
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
    configurarModalConfirmacion();
    configurarFiltrosConsultas();
    cargarMascotas();
});