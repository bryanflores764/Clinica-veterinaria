// ============================================================
// Archivo: js/administrador/crear-mascota.js
// ============================================================

const URL_API = window.API_URL;

// Formulario
const formularioNuevaMascota = document.getElementById("formNuevaMascota");

// Campos principales
const inputNombreMascota = document.getElementById("nombreMascota");
const inputFechaNacimiento = document.getElementById("fechaNacimiento");
const inputPesoMascota = document.getElementById("pesoMascota");
const inputColorMascota = document.getElementById("colorMascota");

// Selects
const selectPropietario = document.getElementById("propietarioMascota");
const selectEspecie = document.getElementById("especieMascota");
const selectRaza = document.getElementById("razaMascota");

// Botones para crear nuevos catálogos
const btnNuevaEspecie = document.getElementById("btnNuevaEspecie");
const btnNuevaRaza = document.getElementById("btnNuevaRaza");

// Contenedores de nuevos campos
const contenedorNuevaEspecie = document.getElementById("contenedorNuevaEspecie");
const contenedorNuevaRaza = document.getElementById("contenedorNuevaRaza");

// Inputs nuevos
const inputNuevaEspecie = document.getElementById("inputNuevaEspecie");
const inputNuevaRaza = document.getElementById("inputNuevaRaza");

// Botón principal
const btnCrear = document.querySelector(".btn-crear");

// Estado local
let cachePropietarios = [];
let cacheEspecies = [];
let cacheRazas = [];

// ============================================================
// Sesión y headers
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
// Utilidades
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

async function intentarLeerError(respuesta) {
    try {
        const datos = await respuesta.json();
        return datos?.message || datos?.error || null;
    } catch {
        return null;
    }
}

// ============================================================
// Toast
// ============================================================

function mostrarToast(mensaje, tipo = "error") {
    document.querySelector(".vc-toast")?.remove();

    const config = {
        success: { color: "#2e7d6b", border: "#22c55e", icon: "✔" },
        error: { color: "#c0392b", border: "#ef4444", icon: "✖" },
        warning: { color: "#b45309", border: "#f59e0b", icon: "⚠" },
    };

    const { color, border, icon } = config[tipo] ?? config.error;

    if (!document.getElementById("vc-toast-styles")) {
        const style = document.createElement("style");
        style.id = "vc-toast-styles";
        style.textContent = `
            .vc-toast {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px 20px;
                border-radius: 12px;
                border-left: 5px solid;
                background: #fff;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                max-width: 360px;
                font-family: 'Baloo Da 2', sans-serif;
                animation: vcSlideIn .3s ease;
            }

            .vc-toast-icon {
                font-size: 20px;
                font-weight: 700;
                flex-shrink: 0;
                margin-top: 1px;
            }

            .vc-toast-body p {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                line-height: 1.5;
            }

            .vc-toast.saliendo {
                animation: vcSlideOut .3s ease forwards;
            }

            @keyframes vcSlideIn {
                from { opacity: 0; transform: translateX(60px); }
                to { opacity: 1; transform: translateX(0); }
            }

            @keyframes vcSlideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(60px); }
            }
        `;

        document.head.appendChild(style);
    }

    const toast = document.createElement("div");
    toast.className = "vc-toast";
    toast.style.borderColor = border;

    toast.innerHTML = `
        <span class="vc-toast-icon" style="color:${color}">${icon}</span>
        <div class="vc-toast-body">
            <p>${mensaje}</p>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("saliendo");

        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
// Estado del formulario
// ============================================================

function cambiarEstadoBotonCrear(estado) {
    if (!btnCrear) return;

    btnCrear.disabled = estado;
    btnCrear.textContent = estado ? "Creando..." : "Crear Mascota";
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

    inputNombreMascota.focus();
}

// ============================================================
// Renderizar selects
// ============================================================

function renderizarPropietarios(propietarios) {
    selectPropietario.innerHTML = `<option value="">Seleccione un propietario</option>`;

    propietarios.forEach((propietario) => {
        const id = obtenerId(propietario);
        const nombre = obtenerNombre(propietario);

        const option = document.createElement("option");
        option.value = id;
        option.textContent = nombre || `Propietario ${id}`;

        selectPropietario.appendChild(option);
    });
}

function renderizarEspecies(especies) {
    selectEspecie.innerHTML = `<option value="">Seleccione una especie</option>`;

    especies.forEach((especie) => {
        const id = obtenerId(especie);
        const nombre = obtenerNombre(especie);

        const option = document.createElement("option");
        option.value = id;
        option.textContent = nombre || `Especie ${id}`;

        selectEspecie.appendChild(option);
    });
}

function renderizarRazasFiltradas(razas) {
    selectRaza.innerHTML = `<option value="">Seleccione una raza</option>`;

    razas.forEach((raza) => {
        const id = obtenerId(raza);
        const nombre = obtenerNombre(raza);

        const option = document.createElement("option");
        option.value = id;
        option.textContent = nombre || `Raza ${id}`;

        selectRaza.appendChild(option);
    });
}

function filtrarRazasPorEspecie(idEspecie) {
    if (!idEspecie) {
        renderizarRazasFiltradas([]);
        return;
    }

    const razasFiltradas = cacheRazas.filter((raza) => {
        const idEspecieRaza = obtenerEspecieIdDeRaza(raza);

        return Number(idEspecieRaza) === Number(idEspecie);
    });

    renderizarRazasFiltradas(razasFiltradas);
}

// ============================================================
// Cargar datos iniciales
// ============================================================

async function cargarPropietarios() {
    const respuesta = await fetch(`${URL_API}/api/propietarios`, {
        method: "GET",
        headers: obtenerEncabezados(false),
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

    renderizarPropietarios(cachePropietarios);
}

async function cargarEspecies() {
    const respuesta = await fetch(`${URL_API}/api/especies`, {
        method: "GET",
        headers: obtenerEncabezados(false),
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

    renderizarEspecies(cacheEspecies);
}

async function cargarRazas() {
    const respuesta = await fetch(`${URL_API}/api/razas`, {
        method: "GET",
        headers: obtenerEncabezados(false),
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

    const especieSeleccionada = selectEspecie.value;

    if (especieSeleccionada) {
        filtrarRazasPorEspecie(especieSeleccionada);
    } else {
        renderizarRazasFiltradas([]);
    }
}

async function cargarDatosInicialesFormulario() {
    try {
        await cargarPropietarios();
        await cargarEspecies();
        await cargarRazas();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        mostrarToast(error.message || "Ocurrió un error al cargar los datos del formulario.", "error");
    }
}

// ============================================================
// Nueva especie y nueva raza
// ============================================================

function configurarNuevaEspecie() {
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
}

function configurarNuevaRaza() {
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
}

function configurarCambioEspecie() {
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
}

// ============================================================
// Crear especie y raza si no existen
// ============================================================

function buscarIdEspeciePorNombre(nombre) {
    const especie = cacheEspecies.find((item) => {
        return obtenerNombre(item).toLowerCase() === nombre.toLowerCase();
    });

    return especie ? obtenerId(especie) : null;
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

    if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesionForzada();
        return null;
    }

    if (!respuesta.ok) {
        const errorData = await intentarLeerError(respuesta);
        throw new Error(errorData || "No se pudo crear la especie.");
    }

    const datos = await respuesta.json();

    await cargarEspecies();

    const especieCreada = datos?.data ?? datos?.result ?? datos;

    return obtenerId(especieCreada) || buscarIdEspeciePorNombre(nuevaEspecie);
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

    if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesionForzada();
        return null;
    }

    if (!respuesta.ok) {
        const errorData = await intentarLeerError(respuesta);
        throw new Error(errorData || "No se pudo crear la raza.");
    }

    const datos = await respuesta.json();

    await cargarRazas();

    const razaCreada = datos?.data ?? datos?.result ?? datos;

    return obtenerId(razaCreada) || buscarIdRazaPorNombreYEspecie(nuevaRaza, idEspecie);
}

// ============================================================
// Validaciones
// ============================================================

function validarDatosMascota(datosMascota) {
    if (!datosMascota.nombre) {
        return "El nombre de la mascota es obligatorio.";
    }

    if (datosMascota.nombre.length < 2) {
        return "El nombre de la mascota debe tener al menos 2 caracteres.";
    }

    if (!datosMascota.fecha_nacimiento) {
        return "La fecha de nacimiento es obligatoria.";
    }

    if (!datosMascota.propietarioId) {
        return "Debe seleccionar un propietario.";
    }

    if (!datosMascota.razaId) {
        return "Debe seleccionar una raza o crear una nueva.";
    }

    if (!datosMascota.color) {
        return "El color es obligatorio.";
    }

    if (!datosMascota.peso || Number.isNaN(datosMascota.peso) || datosMascota.peso <= 0) {
        return "El peso debe ser mayor a 0.";
    }

    return null;
}

// ============================================================
// Crear mascota
// ============================================================

async function manejarSubmitCrearMascota(e) {
    e.preventDefault();

    try {
        cambiarEstadoBotonCrear(true);

        const nombre = limpiarTexto(inputNombreMascota.value);
        const fechaNacimiento = inputFechaNacimiento.value;
        const peso = Number(inputPesoMascota.value);
        const color = limpiarTexto(inputColorMascota.value);
        const propietarioId = Number(selectPropietario.value);

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

        const errorValidacion = validarDatosMascota(datosMascota);

        if (errorValidacion) {
            throw new Error(errorValidacion);
        }

        const respuesta = await fetch(`${URL_API}/api/mascotas`, {
            method: "POST",
            headers: obtenerEncabezados(true),
            body: JSON.stringify(datosMascota),
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesionForzada();
            return;
        }

        if (!respuesta.ok) {
            const errorData = await intentarLeerError(respuesta);
            throw new Error(errorData || "No se pudo crear la mascota.");
        }

        const resultado = await respuesta.json().catch(() => ({}));

        mostrarToast(resultado.message || "Mascota creada correctamente.", "success");

        resetearFormularioMascota();

        await cargarPropietarios();
        await cargarEspecies();
        await cargarRazas();

    } catch (error) {
        console.error("Error al crear mascota:", error);
        mostrarToast(error.message || "Ocurrió un error al crear la mascota.", "error");
    } finally {
        cambiarEstadoBotonCrear(false);
    }
}

// ============================================================
// Init
// ============================================================

function init() {
    verificarSesion();

    cargarDatosInicialesFormulario();

    configurarNuevaEspecie();
    configurarNuevaRaza();
    configurarCambioEspecie();

    formularioNuevaMascota.addEventListener("submit", manejarSubmitCrearMascota);
}

document.addEventListener("DOMContentLoaded", init);