// ============================================================
// Archivo: js/administrador/ver-mascota.js
// ============================================================

const URL_API = "http://localhost:3000";

// Tabla y búsqueda
const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");

// Modal eliminar
const modalEliminar = document.getElementById("modal-eliminar");
const modalEliminarTexto = document.getElementById("modal-eliminar-texto");
const btnCancelarEliminacion = document.getElementById("cancelar-eliminacion");
const btnConfirmarEliminacion = document.getElementById("confirmar-eliminacion");

// Modal editar
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

// Estado local
let mascotas = [];
let mascotasFiltradas = [];
let cachePropietarios = [];
let cacheEspecies = [];
let cacheRazas = [];

let mascotaSeleccionadaParaEliminar = null;
let mascotaEditandoId = null;

// ============================================================
// Sesión y headers
// ============================================================

function obtenerToken() {
    return localStorage.getItem("token");
}

function verificarSesion() {
    const tokenActual = obtenerToken();

    if (!tokenActual || tokenActual === "null" || tokenActual === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.replace("../../index.html");
    }
}

function cerrarSesionForzada() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("../../index.html");
}

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

// ============================================================
// Utilidades generales
// ============================================================

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
    return String(texto || "").trim().replace(/\s+/g, " ");
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function intentarLeerError(respuesta) {
    try {
        const datos = await respuesta.json();
        return datos?.message || datos?.error || null;
    } catch {
        return null;
    }
}

function mostrarMensaje(mensaje) {
    alert(mensaje);
}

// ============================================================
// Formato de datos
// ============================================================

function formatearFecha(fecha) {
    if (!fecha) return "";

    if (typeof fecha === "string" && fecha.includes("T")) {
        const [soloFecha] = fecha.split("T");
        const partes = soloFecha.split("-");

        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) return "";

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}-${mes}-${anio}`;
}

function formatearFechaInput(fecha) {
    if (!fecha) return "";

    if (typeof fecha === "string" && fecha.includes("T")) {
        return fecha.split("T")[0];
    }

    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return fecha;
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) return "";

    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function formatearPeso(peso) {
    if (peso === null || peso === undefined || peso === "") return "";

    const pesoNumero = Number(peso);

    if (isNaN(pesoNumero)) return "";

    return pesoNumero % 1 === 0 ? pesoNumero.toString() : pesoNumero.toFixed(2);
}

// ============================================================
// Obtener datos de mascota con nombres flexibles
// ============================================================

function getMascotaId(mascota) {
    return mascota?.Id ?? mascota?.id ?? mascota?.ID ?? "";
}

function getMascotaNombre(mascota) {
    return mascota?.Nombre ?? mascota?.nombre ?? "";
}

function getMascotaEspecie(mascota) {
    return mascota?.Nombre_Especie ?? mascota?.nombre_especie ?? mascota?.Especie ?? mascota?.especie ?? "";
}

function getMascotaRaza(mascota) {
    return mascota?.Nombre_Raza ?? mascota?.nombre_raza ?? mascota?.Raza ?? mascota?.raza ?? "";
}

function getMascotaPeso(mascota) {
    return mascota?.Peso ?? mascota?.peso ?? "";
}

function getMascotaFechaNacimiento(mascota) {
    return mascota?.Fecha_Nacimiento ?? mascota?.fecha_nacimiento ?? mascota?.FechaNacimiento ?? "";
}

function getMascotaPropietario(mascota) {
    return mascota?.Propietario ?? mascota?.propietario ?? mascota?.Nombre_Propietario ?? mascota?.nombre_propietario ?? "";
}

function getMascotaColor(mascota) {
    return mascota?.Color ?? mascota?.color ?? "";
}

// ============================================================
// Cargar mascotas
// ============================================================

async function cargarMascotas() {
    try {
        const respuesta = await fetch(`${URL_API}/api/mascotas`, {
            method: "GET",
            headers: obtenerEncabezados(false)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesionForzada();
            return;
        }

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudieron cargar las mascotas.");
        }

        mascotas = obtenerArregloRespuesta(resultado);

        mascotas.sort((a, b) => Number(getMascotaId(a)) - Number(getMascotaId(b)));

        mascotasFiltradas = [...mascotas];

        renderizarMascotas(mascotasFiltradas);

    } catch (error) {
        console.error("Error al cargar mascotas:", error);

        tbody.innerHTML = "";
        emptyMsg.textContent = "No se pudieron cargar las mascotas.";
        emptyMsg.style.display = "block";
    }
}

// ============================================================
// Render tabla
// ============================================================

function renderizarMascotas(lista) {
    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        emptyMsg.textContent = "No hay mascotas para mostrar.";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";

    lista.forEach((mascota) => {
        const id = getMascotaId(mascota);
        const nombre = getMascotaNombre(mascota);

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td style="text-align: center;">${escapeHtml(id)}</td>
            <td style="text-align: center;">${escapeHtml(nombre)}</td>
            <td style="text-align: center;">${escapeHtml(getMascotaEspecie(mascota))}</td>
            <td style="text-align: center;">${escapeHtml(getMascotaRaza(mascota))}</td>
            <td style="text-align: center;">${escapeHtml(formatearPeso(getMascotaPeso(mascota)))}</td>
            <td style="text-align: center;">${escapeHtml(formatearFecha(getMascotaFechaNacimiento(mascota)))}</td>
            <td style="text-align: center;">${escapeHtml(getMascotaPropietario(mascota))}</td>
            <td style="text-align: center;">
                <button type="button" class="btn-accion btn-editar" data-id="${escapeHtml(id)}">
                    Editar
                </button>

                <button
                    type="button"
                    class="btn-accion btn-eliminar"
                    data-id="${escapeHtml(id)}"
                    data-nombre="${escapeHtml(nombre)}"
                >
                    Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// ============================================================
// Búsqueda
// ============================================================

function configurarBusqueda() {
    searchInput.addEventListener("input", (e) => {
        const texto = e.target.value.trim().toLowerCase();

        mascotasFiltradas = mascotas.filter((mascota) => {
            const nombre = getMascotaNombre(mascota).toLowerCase().trim();
            const propietario = getMascotaPropietario(mascota).toLowerCase().trim();

            return nombre.includes(texto) || propietario.includes(texto);
        });

        renderizarMascotas(mascotasFiltradas);
    });
}

// ============================================================
// Modal eliminar
// ============================================================

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
            cerrarSesionForzada();
            return;
        }

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(resultado.message || "No se pudo eliminar la mascota.");
        }

        cerrarModalEliminar();

        await cargarMascotas();

    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        mostrarMensaje(error.message || "Ocurrió un error al eliminar la mascota.");
    } finally {
        btnConfirmarEliminacion.disabled = false;
        btnConfirmarEliminacion.textContent = "Eliminar";
    }
}

// ============================================================
// Cargar catálogos editar
// ============================================================

async function cargarPropietarios() {
    const respuesta = await fetch(`${URL_API}/api/propietarios`, {
        method: "GET",
        headers: obtenerEncabezados(false)
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesionForzada();
        return;
    }

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los propietarios.");
    }

    const datos = await respuesta.json();

    cachePropietarios = obtenerArregloRespuesta(datos);
}

async function cargarEspecies() {
    const respuesta = await fetch(`${URL_API}/api/especies`, {
        method: "GET",
        headers: obtenerEncabezados(false)
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesionForzada();
        return;
    }

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las especies.");
    }

    const datos = await respuesta.json();

    cacheEspecies = obtenerArregloRespuesta(datos);
}

async function cargarRazas() {
    const respuesta = await fetch(`${URL_API}/api/razas`, {
        method: "GET",
        headers: obtenerEncabezados(false)
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesionForzada();
        return;
    }

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las razas.");
    }

    const datos = await respuesta.json();

    cacheRazas = obtenerArregloRespuesta(datos);
}

async function cargarCatalogosEditar() {
    try {
        if (!cachePropietarios.length) {
            await cargarPropietarios();
        }

        if (!cacheEspecies.length) {
            await cargarEspecies();
        }

        if (!cacheRazas.length) {
            await cargarRazas();
        }

        renderizarPropietariosEditar(cachePropietarios);
        renderizarEspeciesEditar(cacheEspecies);
        renderizarRazasEditar([]);

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message || "No se pudieron cargar los datos del formulario de edición.");
    }
}

// ============================================================
// Render selects editar
// ============================================================

function renderizarPropietariosEditar(propietarios) {
    selectEditarPropietario.innerHTML = `<option value="">Seleccione un propietario</option>`;

    propietarios.forEach((propietario) => {
        const option = document.createElement("option");

        option.value = obtenerId(propietario);
        option.textContent = obtenerNombre(propietario) || `Propietario ${obtenerId(propietario)}`;

        selectEditarPropietario.appendChild(option);
    });
}

function renderizarEspeciesEditar(especies) {
    selectEditarEspecie.innerHTML = `<option value="">Seleccione una especie</option>`;

    especies.forEach((especie) => {
        const option = document.createElement("option");

        option.value = obtenerId(especie);
        option.textContent = obtenerNombre(especie) || `Especie ${obtenerId(especie)}`;

        selectEditarEspecie.appendChild(option);
    });
}

function renderizarRazasEditar(razas) {
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

// ============================================================
// Buscar datos para editar
// ============================================================

function buscarMascotaLocalPorId(id) {
    return mascotas.find((mascota) => Number(getMascotaId(mascota)) === Number(id)) || null;
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
    const propietario = cachePropietarios.find((item) => {
        return obtenerNombre(item).toLowerCase().trim() === String(nombrePropietario || "").toLowerCase().trim();
    });

    return propietario ? obtenerId(propietario) : null;
}

function inferirEspecieIdPorNombre(nombreEspecie) {
    const especie = cacheEspecies.find((item) => {
        return obtenerNombre(item).toLowerCase().trim() === String(nombreEspecie || "").toLowerCase().trim();
    });

    return especie ? obtenerId(especie) : null;
}

function inferirRazaIdPorNombreYEspecie(nombreRaza, idEspecie) {
    const raza = cacheRazas.find((item) => {
        return (
            obtenerNombre(item).toLowerCase().trim() === String(nombreRaza || "").toLowerCase().trim() &&
            Number(obtenerEspecieIdDeRaza(item)) === Number(idEspecie)
        );
    });

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

// ============================================================
// Modal editar
// ============================================================

function abrirModalEditarMascota() {
    modalEditarMascota.classList.add("show");
    fondoModalEditarMascota.classList.add("show");
    document.body.style.overflow = "hidden";
}

function cerrarModalEditarMascota() {
    modalEditarMascota.classList.remove("show");
    fondoModalEditarMascota.classList.remove("show");
    document.body.style.overflow = "";

    resetearFormularioEditarMascota();
}

function resetearFormularioEditarMascota() {
    formularioEditarMascota.reset();

    mascotaEditandoId = null;

    selectEditarRaza.innerHTML = `<option value="">Seleccione una raza</option>`;
}

function cambiarEstadoBotonEditar(estado) {
    const btnGuardar = formularioEditarMascota.querySelector('button[type="submit"]');

    if (!btnGuardar) return;

    btnGuardar.disabled = estado;
    btnGuardar.textContent = estado ? "Guardando..." : "Guardar cambios";
}

async function abrirEditarMascota(idMascota) {
    try {
        await cargarCatalogosEditar();

        const mascota = await obtenerDetalleMascota(idMascota);

        if (!mascota) {
            throw new Error("No se encontró la información de la mascota.");
        }

        mascotaEditandoId = Number(idMascota);

        const nombre = getMascotaNombre(mascota);
        const fechaNacimiento = getMascotaFechaNacimiento(mascota);
        const peso = getMascotaPeso(mascota);
        const color = getMascotaColor(mascota);

        let propietarioId = obtenerIdPropietarioDesdeMascota(mascota);
        let especieId = obtenerIdEspecieDesdeMascota(mascota);
        let razaId = obtenerIdRazaDesdeMascota(mascota);

        if (!propietarioId) {
            propietarioId = inferirPropietarioIdPorNombre(getMascotaPropietario(mascota));
        }

        if (!especieId) {
            especieId = inferirEspecieIdPorNombre(getMascotaEspecie(mascota));
        }

        if (!razaId && especieId) {
            razaId = inferirRazaIdPorNombreYEspecie(getMascotaRaza(mascota), especieId);
        }

        inputEditarNombreMascota.value = nombre || "";
        inputEditarFechaNacimiento.value = formatearFechaInput(fechaNacimiento);
        inputEditarPesoMascota.value = peso || "";
        inputEditarColorMascota.value = color || "";

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

// ============================================================
// Eventos editar
// ============================================================

function configurarEventosEditar() {
    tbody.addEventListener("click", async (e) => {
        const botonEditar = e.target.closest(".btn-editar");

        if (!botonEditar) return;

        const idMascota = botonEditar.dataset.id;

        if (!idMascota) {
            mostrarMensaje("No se pudo identificar la mascota a editar.");
            return;
        }

        await abrirEditarMascota(idMascota);
    });
}

function configurarModalEditar() {
    btnCerrarModalEditarMascota.addEventListener("click", cerrarModalEditarMascota);
    btnCancelarEditarMascota.addEventListener("click", cerrarModalEditarMascota);

    fondoModalEditarMascota.addEventListener("click", cerrarModalEditarMascota);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalEditarMascota.classList.contains("show")) {
            cerrarModalEditarMascota();
        }
    });

    selectEditarEspecie.addEventListener("change", () => {
        const idEspecie = selectEditarEspecie.value;

        selectEditarRaza.value = "";

        filtrarRazasEditarPorEspecie(idEspecie);
    });

    formularioEditarMascota.addEventListener("submit", guardarCambiosMascota);
}

async function guardarCambiosMascota(e) {
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
        const razaId = Number(selectEditarRaza.value);

        if (!nombre || !fechaNacimiento || !color || !propietarioId || !razaId || Number.isNaN(peso)) {
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
            body: JSON.stringify(datosMascota)
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesionForzada();
            return;
        }

        if (!respuesta.ok) {
            const errorData = await intentarLeerError(respuesta);
            throw new Error(errorData || "No se pudo actualizar la mascota.");
        }

        await respuesta.json().catch(() => ({}));

        mostrarMensaje("Mascota actualizada correctamente.");

        cerrarModalEditarMascota();

        await cargarMascotas();

    } catch (error) {
        console.error("Error al editar mascota:", error);
        mostrarMensaje(error.message || "Ocurrió un error al actualizar la mascota.");
    } finally {
        cambiarEstadoBotonEditar(false);
    }
}

// ============================================================
// Init
// ============================================================

function init() {
    verificarSesion();

    cargarMascotas();

    configurarBusqueda();
    configurarEventosEliminar();
    configurarModalEliminar();

    configurarEventosEditar();
    configurarModalEditar();
}

document.addEventListener("DOMContentLoaded", init);