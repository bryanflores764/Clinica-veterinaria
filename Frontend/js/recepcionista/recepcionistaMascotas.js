// URL base de la API
const URL_API = "http://localhost:3000";

// Botones y elementos del modal
const btnNuevoPaciente = document.getElementById("btn-nuevoPaciente");
const modalMascota = document.getElementById("modalMascota");
const fondoModalMascota = document.getElementById("modalMascotaBackdrop");
const btnCerrarModalMascota = document.getElementById("btnCerrarModalMascota");
const btnCancelarMascota = document.getElementById("btnCancelarMascota");
const formularioNuevaMascota = document.getElementById("formNuevaMascota");

// Campos
const inputNombreMascota = document.getElementById("nombreMascota");
const inputFechaNacimiento = document.getElementById("fechaNacimiento");
const inputPesoMascota = document.getElementById("pesoMascota");
const inputColorMascota = document.getElementById("colorMascota");

const selectPropietario = document.getElementById("propietarioMascota");
const selectEspecie = document.getElementById("especieMascota");
const selectRaza = document.getElementById("razaMascota");

const btnNuevaEspecie = document.getElementById("btnNuevaEspecie");
const btnNuevaRaza = document.getElementById("btnNuevaRaza");

const contenedorNuevaEspecie = document.getElementById("contenedorNuevaEspecie");
const contenedorNuevaRaza = document.getElementById("contenedorNuevaRaza");

const inputNuevaEspecie = document.getElementById("inputNuevaEspecie");
const inputNuevaRaza = document.getElementById("inputNuevaRaza");

// Estado local
let cacheEspecies = [];
let cacheRazas = [];
let cachePropietarios = [];

/* =========================================================
    utilidades
========================================================= */
function obtenerToken() {
    return localStorage.getItem("token");
}

function verificarSesion() {
    const tokenActual = obtenerToken();

    if (!tokenActual || tokenActual === "null" || tokenActual === "undefined") {
        localStorage.removeItem("token");
        window.location.replace("../../index.html");
    }
}

verificarSesion();

function obtenerEncabezados(esJson = true) {
    const encabezados = {};

    if (esJson) {
        encabezados["Content-Type"] = "application/json";
    }

    const token = obtenerToken();
    if (token) {
        encabezados["Authorization"] = `Bearer ${token}`;
    }

    return encabezados;
}

function obtenerArregloRespuesta(datos) {
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.data)) return datos.data;
    if (Array.isArray(datos?.result)) return datos.result;
    return [];
}

function obtenerId(item) {
    return (
        item?.id ??
        item?.Id ??
        item?.ID ??
        item?.Id_Especie ??
        item?.id_especie ??
        item?.Id_Raza ??
        item?.id_raza ??
        item?.Id_Propietario ??
        item?.id_propietario ??
        null
    );
}

function obtenerNombre(item) {
    return (
        item?.nombre ??
        item?.Nombre ??
        item?.Nombre_Raza ??
        item?.nombre_raza ??
        item?.Nombre_Especie ??
        item?.nombre_especie ??
        item?.Nombre_Propietario ??
        item?.nombre_propietario ??
        item?.Nombre_Completo ??
        item?.nombre_completo ??
        item?.Nombre_Cliente ??
        item?.nombre_cliente ??
        ""
    );
}

function obtenerEspecieIdDeRaza(raza) {
    return (
        raza?.especieId ??
        raza?.EspecieId ??
        raza?.especie_id ??
        raza?.Id_Especie ??
        raza?.id_especie ??
        null
    );
}
function limpiarTexto(texto) {
    return texto.trim().replace(/\s+/g, " ");
}

function mostrarMensaje(mensaje) {
    alert(mensaje);
}

function cambiarEstadoBotonGuardar(estado) {
    const btnGuardar = formularioNuevaMascota.querySelector('button[type="submit"]');
    if (!btnGuardar) return;

    btnGuardar.disabled = estado;
    btnGuardar.textContent = estado ? "Guardando..." : "Guardar mascota";
}

/* =========================================================
    modal
========================================================= */

function abrirModalMascota() {
    modalMascota.classList.add("show");
    fondoModalMascota.classList.add("show");
    document.body.style.overflow = "hidden";

    cargarDatosInicialesModal();
}

function cerrarModalMascota() {
    modalMascota.classList.remove("show");
    fondoModalMascota.classList.remove("show");
    document.body.style.overflow = "";

    resetearFormularioMascota();
}

function resetearFormularioMascota() {
    formularioNuevaMascota.reset();

    contenedorNuevaEspecie.classList.add("hidden");
    contenedorNuevaRaza.classList.add("hidden");

    inputNuevaEspecie.value = "";
    inputNuevaRaza.value = "";

    inputNuevaEspecie.required = false;
    inputNuevaRaza.required = false;

    selectEspecie.required = true;
    selectRaza.required = true;

    renderizarRazasFiltradas([]);
}

if (btnNuevoPaciente) {
    btnNuevoPaciente.addEventListener("click", abrirModalMascota);
}

if (btnCerrarModalMascota) {
    btnCerrarModalMascota.addEventListener("click", cerrarModalMascota);
}

if (btnCancelarMascota) {
    btnCancelarMascota.addEventListener("click", cerrarModalMascota);
}

if (fondoModalMascota) {
    fondoModalMascota.addEventListener("click", cerrarModalMascota);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalMascota.classList.contains("show")) {
        cerrarModalMascota();
    }
});

/* =========================================================
    renderizar los selects
========================================================= */

function renderizarPropietarios(propietarios) {
    selectPropietario.innerHTML = `<option value="">Seleccione un propietario</option>`;

    propietarios.forEach((propietario) => {
        const option = document.createElement("option");
        option.value = obtenerId(propietario);
        option.textContent = obtenerNombre(propietario) || `Propietario ${obtenerId(propietario)}`;
        selectPropietario.appendChild(option);
    });
}

function renderizarEspecies(especies) {
    selectEspecie.innerHTML = `<option value="">Seleccione una especie</option>`;

    console.log("Especies recibidas:", especies);

    especies.forEach((especie) => {
        const id = obtenerId(especie);
        const nombre = obtenerNombre(especie);

        const option = document.createElement("option");
        option.value = id;
        option.textContent = nombre || `Especie ${id}`;

        console.log("Render especie =>", { especie, id, nombre });

        selectEspecie.appendChild(option);
    });
}

function renderizarRazasFiltradas(razas) {
    selectRaza.innerHTML = `<option value="">Seleccione una raza</option>`;

    razas.forEach((raza) => {
        const option = document.createElement("option");
        option.value = obtenerId(raza);
        option.textContent = obtenerNombre(raza);
        selectRaza.appendChild(option);
    });
}

function filtrarRazasPorEspecie(idEspecie) {
    console.log("ID especie seleccionada:", idEspecie);

    if (!idEspecie) {
        renderizarRazasFiltradas([]);
        return;
    }

    const razasFiltradas = cacheRazas.filter((raza) => {
        const idEspecieRaza = obtenerEspecieIdDeRaza(raza);

        console.log("Comparando raza:", {
        raza,
        idEspecieRaza,
        idEspecieSeleccionada: idEspecie
        });

        return Number(idEspecieRaza) === Number(idEspecie);
    });

    console.log("Razas filtradas finales:", razasFiltradas);

    renderizarRazasFiltradas(razasFiltradas);
}

/* =========================================================
    carga de datos
========================================================= */

async function cargarPropietarios() {
    const respuesta = await fetch(`${URL_API}/api/propietarios`, {
        method: "GET",
        headers: obtenerEncabezados(false),
    });

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los propietarios.");
    }

    const datos = await respuesta.json();
    cachePropietarios = obtenerArregloRespuesta(datos);
    renderizarPropietarios(cachePropietarios);
}

async function cargarEspecies() {
    const respuesta = await fetch(`${URL_API}/api/especies`, {
        method: "GET",
        headers: obtenerEncabezados(false),
    });

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las especies.");
    }

    const datos = await respuesta.json();
    cacheEspecies = obtenerArregloRespuesta(datos);
    renderizarEspecies(cacheEspecies);
}

async function cargarRazas() {
    const respuesta = await fetch(`${URL_API}/api/razas`, {
        method: "GET",
        headers: obtenerEncabezados(false),
    });

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las razas.");
    }

    const datos = await respuesta.json();
    cacheRazas = obtenerArregloRespuesta(datos);

    // Reconstruir especies a partir de las razas
    const especiesMap = new Map();

    cacheRazas.forEach((raza) => {
        const idEspecie = raza?.Id_Especie ?? raza?.id_especie ?? raza?.EspecieId ?? raza?.especieId;
        const nombreEspecie = raza?.Nombre_Especie ?? raza?.nombre_especie;

        if (idEspecie && nombreEspecie && !especiesMap.has(Number(idEspecie))) {
        especiesMap.set(Number(idEspecie), {
            Id: Number(idEspecie),
            Nombre_Especie: nombreEspecie
        });
        }
    });


    const especieSeleccionada = selectEspecie.value;
    if (especieSeleccionada) {
        filtrarRazasPorEspecie(especieSeleccionada);
    } else {
        renderizarRazasFiltradas([]);
    }
}

async function cargarDatosInicialesModal() {
    try {
        await cargarPropietarios();
        await cargarRazas();
        await cargarEspecies();
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "Ocurrió un error al cargar los datos del formulario.");
    }
}

/* =========================================================
    nueva especie y raza
========================================================= */

btnNuevaEspecie.addEventListener("click", () => {
    contenedorNuevaEspecie.classList.toggle("hidden");

    const visible = !contenedorNuevaEspecie.classList.contains("hidden");

    inputNuevaEspecie.required = visible;
    selectEspecie.required = !visible;

    if (visible) {
        selectEspecie.value = "";
        selectRaza.value = "";
        inputNuevaRaza.value = "";
        contenedorNuevaRaza.classList.add("hidden");
        inputNuevaRaza.required = false;
        selectRaza.required = true;
        inputNuevaEspecie.focus();
        renderizarRazasFiltradas([]);
    } else {
        inputNuevaEspecie.value = "";
        inputNuevaEspecie.required = false;
        selectEspecie.required = true;
    }
});

btnNuevaRaza.addEventListener("click", () => {
    contenedorNuevaRaza.classList.toggle("hidden");

    const visible = !contenedorNuevaRaza.classList.contains("hidden");

    inputNuevaRaza.required = visible;
    selectRaza.required = !visible;

    if (visible) {
        selectRaza.value = "";
        inputNuevaRaza.focus();
    } else {
        inputNuevaRaza.value = "";
        inputNuevaRaza.required = false;
        selectRaza.required = true;
    }
});

/* =========================================================
    cambio de especie
========================================================= */

selectEspecie.addEventListener("change", () => {
    const idEspecie = selectEspecie.value;

    if (idEspecie) {
        contenedorNuevaEspecie.classList.add("hidden");
        inputNuevaEspecie.value = "";
        inputNuevaEspecie.required = false;
        selectEspecie.required = true;
    }

    selectRaza.value = "";
    inputNuevaRaza.value = "";
    contenedorNuevaRaza.classList.add("hidden");
    inputNuevaRaza.required = false;
    selectRaza.required = true;

    filtrarRazasPorEspecie(idEspecie);
});

/* =========================================================
    crear especie y raza
========================================================= */

async function crearEspecieSiNoExiste() {
    const nuevaEspecie = limpiarTexto(inputNuevaEspecie.value);

    if (!nuevaEspecie) {
        throw new Error("Debe escribir el nombre de la nueva especie.");
    }

    const especieExistente = cacheEspecies.find((especie) => {
        return obtenerNombre(especie).toLowerCase() === nuevaEspecie.toLowerCase();
    });

    if (especieExistente) {
        return obtenerId(especieExistente);
    }

    const respuesta = await fetch(`${URL_API}/api/especies`, {
        method: "POST",
        headers: obtenerEncabezados(true),
        body: JSON.stringify({
        nombre: nuevaEspecie
        }),
    });

    if (!respuesta.ok) {
        const errorData = await intentarLeerError(respuesta);
        throw new Error(errorData || "No se pudo crear la especie.");
    }

    const datos = await respuesta.json();

    await cargarEspecies();

    const especieCreada = datos?.data ?? datos?.result ?? datos;

    return obtenerId(especieCreada) || buscarIdEspeciePorNombre(nuevaEspecie);
}

function buscarIdEspeciePorNombre(nombre) {
    const especie = cacheEspecies.find((item) => {
        return obtenerNombre(item).toLowerCase() === nombre.toLowerCase();
    });

    return especie ? obtenerId(especie) : null;
}

async function crearRazaSiNoExiste(idEspecie) {
    const nuevaRaza = limpiarTexto(inputNuevaRaza.value);

    if (!nuevaRaza) {
        throw new Error("Debe escribir el nombre de la nueva raza.");
    }

    const razaExistente = cacheRazas.find((raza) => {
        return (
        obtenerNombre(raza).toLowerCase() === nuevaRaza.toLowerCase() &&
        Number(obtenerEspecieIdDeRaza(raza)) === Number(idEspecie)
        );
    });

    if (razaExistente) {
        return obtenerId(razaExistente);
    }

    const respuesta = await fetch(`${URL_API}/api/razas`, {
        method: "POST",
        headers: obtenerEncabezados(true),
        body: JSON.stringify({
        especieId: Number(idEspecie),
        nombre: nuevaRaza
        }),
    });

    if (!respuesta.ok) {
        const errorData = await intentarLeerError(respuesta);
        throw new Error(errorData || "No se pudo crear la raza.");
    }

    const datos = await respuesta.json();

    await cargarRazas();

    const razaCreada = datos?.data ?? datos?.result ?? datos;

    return obtenerId(razaCreada) || buscarIdRazaPorNombreYEspecie(nuevaRaza, idEspecie);
}

function buscarIdRazaPorNombreYEspecie(nombre, idEspecie) {
    const raza = cacheRazas.find((item) => {
        return (
        obtenerNombre(item).toLowerCase() === nombre.toLowerCase() &&
        Number(obtenerEspecieIdDeRaza(item)) === Number(idEspecie)
        );
    });

    return raza ? obtenerId(raza) : null;
}

async function intentarLeerError(respuesta) {
    try {
        const datos = await respuesta.json();
        return datos?.message || datos?.error || null;
    } catch {
        return null;
    }
}

/* =========================================================
    guardar mascota
========================================================= */

formularioNuevaMascota.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        cambiarEstadoBotonGuardar(true);

        const nombre = limpiarTexto(inputNombreMascota.value);
        const fechaNacimiento = inputFechaNacimiento.value;
        const peso = Number(inputPesoMascota.value);
        const color = limpiarTexto(inputColorMascota.value);
        const propietarioId = Number(selectPropietario.value);

        if (!nombre || !fechaNacimiento || !color || !propietarioId || Number.isNaN(peso)) {
        throw new Error("Complete correctamente todos los campos obligatorios.");
        }

        let especieId = selectEspecie.value ? Number(selectEspecie.value) : null;
        let razaId = selectRaza.value ? Number(selectRaza.value) : null;

        const escribioNuevaEspecie =
        !contenedorNuevaEspecie.classList.contains("hidden") &&
        limpiarTexto(inputNuevaEspecie.value);

        const escribioNuevaRaza =
        !contenedorNuevaRaza.classList.contains("hidden") &&
        limpiarTexto(inputNuevaRaza.value);

        if (escribioNuevaEspecie) {
        especieId = await crearEspecieSiNoExiste();
        }

        if (!especieId) {
        throw new Error("Debe seleccionar una especie o crear una nueva.");
        }

        if (escribioNuevaRaza) {
        razaId = await crearRazaSiNoExiste(especieId);
        }

        if (!razaId) {
        throw new Error("Debe seleccionar una raza o crear una nueva.");
        }

        const datosMascota = {
        propietarioId,
        razaId,
        nombre,
        fecha_nacimiento: fechaNacimiento,
        peso,
        color
        };

        const respuesta = await fetch(`${URL_API}/api/mascotas`, {
        method: "POST",
        headers: obtenerEncabezados(true),
        body: JSON.stringify(datosMascota),
        });

        if (!respuesta.ok) {
        const errorData = await intentarLeerError(respuesta);
        throw new Error(errorData || "No se pudo guardar la mascota.");
        }

        await respuesta.json();

        mostrarMensaje("Mascota guardada correctamente.");
        cerrarModalMascota();
        await cargarMascotas();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "Ocurrió un error al guardar la mascota.");
    } finally {
        cambiarEstadoBotonGuardar(false);
    }
});

/* =========================================================
    funcionalidad de la tabla y búsqueda
========================================================= */

const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");

let mascotas = [];
let mascotasFiltradas = [];

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    cargarMascotas();
    configurarBusqueda();
    verificarSesion();
    cargarMascotas();
    configurarBusqueda();
    configurarEventosEliminar();
    configurarModalEliminar();
});

async function cargarMascotas() {
    try {
        const respuesta = await fetch(`${URL_API}/api/mascotas`, {
            method: "GET",
            headers: obtenerEncabezados(false)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudieron cargar las mascotas.");
        }

        mascotas = Array.isArray(resultado.data) ? resultado.data : [];

        mascotas.sort((a, b) => Number(a.Id) - Number(b.Id));

        mascotasFiltradas = [...mascotas];

        renderizarMascotas(mascotasFiltradas);
    } catch (error) {
        console.error("Error al cargar mascotas:", error);
        tbody.innerHTML = "";
        emptyMsg.textContent = "No se pudieron cargar los pacientes.";
        emptyMsg.style.display = "block";
    }
}

function renderizarMascotas(lista) {
    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        emptyMsg.textContent = "No hay pacientes para mostrar.";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";

    lista.forEach((mascota) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td data-label="ID" style="text-align: center;">${mascota.Id ?? ""}</td>
            <td data-label="Nombre" style="text-align: center;">${escapeHtml(mascota.Nombre ?? "")}</td>
            <td data-label="Especie" style="text-align: center;">${escapeHtml(mascota.Nombre_Especie ?? "")}</td>
            <td data-label="Raza" style="text-align: center;">${escapeHtml(mascota.Nombre_Raza ?? "")}</td>
            <td data-label="Peso" style="text-align: center;">${formatearPeso(mascota.Peso)}</td>
            <td data-label="Nacimiento" style="text-align: center;">${formatearFecha(mascota.Fecha_Nacimiento)}</td>
            <td data-label="Propietario" style="text-align: center;">${escapeHtml(mascota.Propietario ?? "")}</td>
            <td data-label="Acciones" style="text-align: center;">
                <button type="button"
                class="btn-accion btn-editar"
                data-id="${mascota.Id}">
                Editar
                </button>
                <button type="button" class="btn-accion btn-eliminar"
                data-id="${mascota.Id}" data-nombre="${escapeHtml(mascota.Nombre ?? "")}">
                Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

function configurarBusqueda() {
    searchInput.addEventListener("input", (e) => {
        const texto = e.target.value.trim().toLowerCase();

        mascotasFiltradas = mascotas.filter((mascota) => {
            const nombre = (mascota.Nombre || "").toLowerCase().trim();
            const propietario = (mascota.Propietario || "").toLowerCase().trim();

            return (
                nombre.includes(texto) ||
                propietario.includes(texto)
            );
        });

        renderizarMascotas(mascotasFiltradas);
    });
}

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

    return pesoNumero % 1 === 0 ? pesoNumero.toString() : pesoNumero.toFixed(2);
}

function escapeHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
    modal de confirmación para eliminar
========================================================== */
const modalEliminar = document.getElementById("modal-eliminar");
const modalEliminarTexto = document.getElementById("modal-eliminar-texto");
const btnCancelarEliminacion = document.getElementById("cancelar-eliminacion");
const btnConfirmarEliminacion = document.getElementById("confirmar-eliminacion");

let mascotaSeleccionadaParaEliminar = null;

function configurarEventosEliminar() {
    tbody.addEventListener("click", (e) => {
        const botonEliminar = e.target.closest(".btn-eliminar");

        if (!botonEliminar) return;

        const id = botonEliminar.dataset.id;
        const nombre = botonEliminar.dataset.nombre;

        mascotaSeleccionadaParaEliminar = id;

        modalEliminarTexto.textContent = `¿Seguro que deseas eliminar a ${nombre}?`;
        abrirModalEliminar();
    });
}

function configurarModalEliminar() {
    btnCancelarEliminacion.addEventListener("click", cerrarModalEliminar);

    btnConfirmarEliminacion.addEventListener("click", async () => {
        if (!mascotaSeleccionadaParaEliminar) return;

        await eliminarMascota(mascotaSeleccionadaParaEliminar);
    });

    modalEliminar.addEventListener("click", (e) => {
        if (e.target === modalEliminar) {
            cerrarModalEliminar();
        }
    });
}

function abrirModalEliminar() {
    modalEliminar.classList.remove("hidden");
}

function cerrarModalEliminar() {
    modalEliminar.classList.add("hidden");
    mascotaSeleccionadaParaEliminar = null;
}

async function eliminarMascota(id) {
    try {
        btnConfirmarEliminacion.disabled = true;
        btnConfirmarEliminacion.textContent = "Eliminando...";

        const respuesta = await fetch(`${URL_API}/api/mascotas/${id}`, {
            method: "DELETE",
            headers: obtenerEncabezados(false)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            window.location.replace("../../index.html");
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo eliminar la mascota.");
        }

        cerrarModalEliminar();
        await cargarMascotas();
    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        alert(error.message || "Ocurrió un error al eliminar la mascota.");
    } finally {
        btnConfirmarEliminacion.disabled = false;
        btnConfirmarEliminacion.textContent = "Eliminar";
    }
}

/* =========================================================
    EDITAR MASCOTA - MODAL
========================================================= */

// Elementos del modal editar
const modalEditarMascota = document.getElementById("modalEditarMascota");
const fondoModalEditarMascota = document.getElementById("modalEditarMascotaBackdrop");
const btnCerrarModalEditarMascota = document.getElementById("btnCerrarModalEditarMascota");
const btnCancelarEditarMascota = document.getElementById("btnCancelarEditarMascota");
const formularioEditarMascota = document.getElementById("formEditarMascota");

// Campos editar
const inputEditarNombreMascota = document.getElementById("editarNombreMascota");
const inputEditarFechaNacimiento = document.getElementById("editarFechaNacimiento");
const inputEditarPesoMascota = document.getElementById("editarPesoMascota");
const inputEditarColorMascota = document.getElementById("editarColorMascota");

const selectEditarPropietario = document.getElementById("editarPropietarioMascota");
const selectEditarEspecie = document.getElementById("editarEspecieMascota");
const selectEditarRaza = document.getElementById("editarRazaMascota");

let mascotaEditandoId = null;

/* =========================================================
    utilidades editar
========================================================= */

function abrirModalEditarMascota() {
    if (!modalEditarMascota || !fondoModalEditarMascota) return;

    modalEditarMascota.classList.add("show");
    fondoModalEditarMascota.classList.add("show");
    document.body.style.overflow = "hidden";
}

function cerrarModalEditarMascota() {
    if (!modalEditarMascota || !fondoModalEditarMascota) return;

    modalEditarMascota.classList.remove("show");
    fondoModalEditarMascota.classList.remove("show");
    document.body.style.overflow = "";

    resetearFormularioEditarMascota();
}

function resetearFormularioEditarMascota() {
    if (formularioEditarMascota) {
        formularioEditarMascota.reset();
    }

    mascotaEditandoId = null;

    if (selectEditarRaza) {
        selectEditarRaza.innerHTML = `<option value="">Seleccione una raza</option>`;
    }
}

function cambiarEstadoBotonEditar(estado) {
    if (!formularioEditarMascota) return;

    const btnGuardar = formularioEditarMascota.querySelector('button[type="submit"]');
    if (!btnGuardar) return;

    btnGuardar.disabled = estado;
    btnGuardar.textContent = estado ? "Guardando..." : "Guardar cambios";
}

function obtenerValorSeguro(valor) {
    return valor ?? "";
}

function formatearFechaInput(fecha) {
    if (!fecha) return "";

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
        if (typeof fecha === "string" && fecha.includes("T")) {
            return fecha.split("T")[0];
        }
        return "";
    }

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

/* =========================================================
    render select editar
========================================================= */

function renderizarPropietariosEditar(propietarios) {
    if (!selectEditarPropietario) return;

    selectEditarPropietario.innerHTML = `<option value="">Seleccione un propietario</option>`;

    propietarios.forEach((propietario) => {
        const option = document.createElement("option");
        option.value = obtenerId(propietario);
        option.textContent = obtenerNombre(propietario) || `Propietario ${obtenerId(propietario)}`;
        selectEditarPropietario.appendChild(option);
    });
}

function renderizarEspeciesEditar(especies) {
    if (!selectEditarEspecie) return;

    selectEditarEspecie.innerHTML = `<option value="">Seleccione una especie</option>`;

    especies.forEach((especie) => {
        const option = document.createElement("option");
        option.value = obtenerId(especie);
        option.textContent = obtenerNombre(especie) || `Especie ${obtenerId(especie)}`;
        selectEditarEspecie.appendChild(option);
    });
}

function renderizarRazasEditar(razas) {
    if (!selectEditarRaza) return;

    selectEditarRaza.innerHTML = `<option value="">Seleccione una raza</option>`;

    razas.forEach((raza) => {
        const option = document.createElement("option");
        option.value = obtenerId(raza);
        option.textContent = obtenerNombre(raza) || `Raza ${obtenerId(raza)}`;
        selectEditarRaza.appendChild(option);
    });
}

function filtrarRazasEditarPorEspecie(idEspecie) {
    if (!idEspecie) {
        renderizarRazasEditar([]);
        return;
    }

    const razasFiltradas = cacheRazas.filter((raza) => {
        return Number(obtenerEspecieIdDeRaza(raza)) === Number(idEspecie);
    });

    renderizarRazasEditar(razasFiltradas);
}

/* =========================================================
    cargar catálogos editar
========================================================= */

async function cargarCatalogosEditar() {
    try {
        if (!cachePropietarios.length) {
            const respuestaPropietarios = await fetch(`${URL_API}/api/propietarios`, {
                method: "GET",
                headers: obtenerEncabezados(false),
            });

            if (!respuestaPropietarios.ok) {
                throw new Error("No se pudieron cargar los propietarios.");
            }

            const datosPropietarios = await respuestaPropietarios.json();
            cachePropietarios = obtenerArregloRespuesta(datosPropietarios);
        }

        if (!cacheEspecies.length) {
            const respuestaEspecies = await fetch(`${URL_API}/api/especies`, {
                method: "GET",
                headers: obtenerEncabezados(false),
            });

            if (!respuestaEspecies.ok) {
                throw new Error("No se pudieron cargar las especies.");
            }

            const datosEspecies = await respuestaEspecies.json();
            cacheEspecies = obtenerArregloRespuesta(datosEspecies);
        }

        if (!cacheRazas.length) {
            const respuestaRazas = await fetch(`${URL_API}/api/razas`, {
                method: "GET",
                headers: obtenerEncabezados(false),
            });

            if (!respuestaRazas.ok) {
                throw new Error("No se pudieron cargar las razas.");
            }

            const datosRazas = await respuestaRazas.json();
            cacheRazas = obtenerArregloRespuesta(datosRazas);
        }

        renderizarPropietariosEditar(cachePropietarios);
        renderizarEspeciesEditar(cacheEspecies);
        renderizarRazasEditar([]);
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "No se pudieron cargar los datos del formulario de edición.");
    }
}

/* =========================================================
    obtener mascota para editar
========================================================= */

function buscarMascotaLocalPorId(id) {
    return mascotas.find((mascota) => Number(mascota.Id) === Number(id)) || null;
}

function obtenerIdPropietarioDesdeMascota(mascota) {
    return (
        mascota?.PropietarioId ??
        mascota?.propietarioId ??
        mascota?.Id_Propietario ??
        mascota?.id_propietario ??
        null
    );
}

function obtenerIdRazaDesdeMascota(mascota) {
    return (
        mascota?.RazaId ??
        mascota?.razaId ??
        mascota?.Id_Raza ??
        mascota?.id_raza ??
        null
    );
}

function obtenerIdEspecieDesdeMascota(mascota) {
    return (
        mascota?.EspecieId ??
        mascota?.especieId ??
        mascota?.Id_Especie ??
        mascota?.id_especie ??
        null
    );
}

function inferirPropietarioIdPorNombre(nombrePropietario) {
    const propietario = cachePropietarios.find((item) =>
        obtenerNombre(item).toLowerCase().trim() === String(nombrePropietario || "").toLowerCase().trim()
    );

    return propietario ? obtenerId(propietario) : null;
}

function inferirEspecieIdPorNombre(nombreEspecie) {
    const especie = cacheEspecies.find((item) =>
        obtenerNombre(item).toLowerCase().trim() === String(nombreEspecie || "").toLowerCase().trim()
    );

    return especie ? obtenerId(especie) : null;
}

function inferirRazaIdPorNombreYEspecie(nombreRaza, idEspecie) {
    const raza = cacheRazas.find((item) =>
        obtenerNombre(item).toLowerCase().trim() === String(nombreRaza || "").toLowerCase().trim() &&
        Number(obtenerEspecieIdDeRaza(item)) === Number(idEspecie)
    );

    return raza ? obtenerId(raza) : null;
}

async function obtenerDetalleMascota(id) {
    try {
        const respuesta = await fetch(`${URL_API}/api/mascotas/${id}`, {
            method: "GET",
            headers: obtenerEncabezados(false)
        });

        if (respuesta.ok) {
            const resultado = await respuesta.json();
            return resultado?.data ?? resultado?.result ?? resultado;
        }
    } catch (error) {
        console.warn("No se pudo obtener detalle por endpoint, se usará dato local.", error);
    }

    return buscarMascotaLocalPorId(id);
}

/* =========================================================
    precargar datos en el modal editar
========================================================= */

async function abrirEditarMascota(idMascota) {
    try {
        await cargarCatalogosEditar();

        const mascota = await obtenerDetalleMascota(idMascota);

        if (!mascota) {
            throw new Error("No se encontró la información de la mascota.");
        }

        mascotaEditandoId = Number(idMascota);

        const nombre = mascota?.Nombre ?? mascota?.nombre ?? "";
        const fechaNacimiento = mascota?.Fecha_Nacimiento ?? mascota?.fecha_nacimiento ?? mascota?.FechaNacimiento ?? "";
        const peso = mascota?.Peso ?? mascota?.peso ?? "";
        const color = mascota?.Color ?? mascota?.color ?? "";

        let propietarioId = obtenerIdPropietarioDesdeMascota(mascota);
        let especieId = obtenerIdEspecieDesdeMascota(mascota);
        let razaId = obtenerIdRazaDesdeMascota(mascota);

        if (!propietarioId) {
            propietarioId = inferirPropietarioIdPorNombre(mascota?.Propietario ?? mascota?.Nombre_Propietario ?? "");
        }

        if (!especieId) {
            especieId = inferirEspecieIdPorNombre(mascota?.Nombre_Especie ?? mascota?.Especie ?? "");
        }

        if (!razaId && especieId) {
            razaId = inferirRazaIdPorNombreYEspecie(
                mascota?.Nombre_Raza ?? mascota?.Raza ?? "",
                especieId
            );
        }

        inputEditarNombreMascota.value = obtenerValorSeguro(nombre);
        inputEditarFechaNacimiento.value = formatearFechaInput(fechaNacimiento);
        inputEditarPesoMascota.value = obtenerValorSeguro(peso);
        inputEditarColorMascota.value = obtenerValorSeguro(color);

        renderizarPropietariosEditar(cachePropietarios);
        renderizarEspeciesEditar(cacheEspecies);

        if (propietarioId) {
            selectEditarPropietario.value = String(propietarioId);
        }

        if (especieId) {
            selectEditarEspecie.value = String(especieId);
            filtrarRazasEditarPorEspecie(especieId);

            if (razaId) {
                selectEditarRaza.value = String(razaId);
            }
        } else {
            renderizarRazasEditar([]);
        }

        abrirModalEditarMascota();
    } catch (error) {
        console.error("Error al abrir edición:", error);
        mostrarMensaje(error.message || "No se pudo abrir el formulario de edición.");
    }
}

/* =========================================================
    eventos modal editar
========================================================= */

if (btnCerrarModalEditarMascota) {
    btnCerrarModalEditarMascota.addEventListener("click", cerrarModalEditarMascota);
}

if (btnCancelarEditarMascota) {
    btnCancelarEditarMascota.addEventListener("click", cerrarModalEditarMascota);
}

if (fondoModalEditarMascota) {
    fondoModalEditarMascota.addEventListener("click", cerrarModalEditarMascota);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEditarMascota && modalEditarMascota.classList.contains("show")) {
        cerrarModalEditarMascota();
    }
});

if (selectEditarEspecie) {
    selectEditarEspecie.addEventListener("change", () => {
        const idEspecie = selectEditarEspecie.value;
        selectEditarRaza.value = "";
        filtrarRazasEditarPorEspecie(idEspecie);
    });
}

/* =========================================================
    click en botón editar de la tabla
========================================================= */

function configurarEventosEditar() {
    if (!tbody) return;

    tbody.addEventListener("click", async (e) => {
        const botonEditar = e.target.closest(".btn-editar");

        if (!botonEditar) return;

        const fila = botonEditar.closest("tr");
        if (!fila) return;

        const primeraCelda = fila.querySelector("td");
        if (!primeraCelda) return;

        const idMascota = primeraCelda.textContent.trim();

        if (!idMascota) {
            mostrarMensaje("No se pudo identificar la mascota a editar.");
            return;
        }

        await abrirEditarMascota(idMascota);
    });
}

/* =========================================================
    guardar cambios mascota
========================================================= */

if (formularioEditarMascota) {
    formularioEditarMascota.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            if (!mascotaEditandoId) {
                throw new Error("No se encontró la mascota a editar.");
            }

            cambiarEstadoBotonEditar(true);

            const nombre = limpiarTexto(inputEditarNombreMascota.value);
            const fechaNacimiento = inputEditarFechaNacimiento.value;
            const peso = Number(inputEditarPesoMascota.value);
            const color = limpiarTexto(inputEditarColorMascota.value);
            const propietarioId = Number(selectEditarPropietario.value);
            const especieId = Number(selectEditarEspecie.value);
            const razaId = Number(selectEditarRaza.value);

            if (!nombre || !fechaNacimiento || !color || !propietarioId || !especieId || !razaId || Number.isNaN(peso)) {
                throw new Error("Complete correctamente todos los campos obligatorios.");
            }

            const datosMascota = {
                propietarioId,
                razaId,
                nombre,
                fecha_nacimiento: fechaNacimiento,
                peso,
                color
            };

            const respuesta = await fetch(`${URL_API}/api/mascotas/${mascotaEditandoId}`, {
                method: "PUT",
                headers: obtenerEncabezados(true),
                body: JSON.stringify(datosMascota),
            });

            if (respuesta.status === 401 || respuesta.status === 403) {
                localStorage.removeItem("token");
                window.location.replace("../../index.html");
                return;
            }

            if (!respuesta.ok) {
                const errorData = await intentarLeerError(respuesta);
                throw new Error(errorData || "No se pudo actualizar la mascota.");
            }

            await respuesta.json();

            mostrarMensaje("Mascota actualizada correctamente.");
            cerrarModalEditarMascota();
            await cargarMascotas();
        } catch (error) {
            console.error("Error al editar mascota:", error);
            mostrarMensaje(error.message || "Ocurrió un error al actualizar la mascota.");
        } finally {
            cambiarEstadoBotonEditar(false);
        }
    });
}


configurarEventosEditar();

/* =========================================================
    menu lateral toggle
========================================================= */
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");

if (menuToggle && sidebar && sidebarBackdrop) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        sidebarBackdrop.classList.toggle("active");

        const abierto = sidebar.classList.contains("active");
        menuToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    sidebarBackdrop.addEventListener("click", () => {
        sidebar.classList.remove("active");
        sidebarBackdrop.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
}