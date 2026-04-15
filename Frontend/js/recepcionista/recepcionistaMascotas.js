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
   UTILIDADES
========================================================= */

function obtenerToken() {
  return localStorage.getItem("token");
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

function obtenerArregloRespuesta(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.result)) return datos.result;
  return [];
}

function obtenerId(item) {
  return item?.id ?? item?.Id ?? item?.ID ?? null;
}

function obtenerNombre(item) {
  return (
    item?.nombre ??
    item?.Nombre ??
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
  return raza?.especieId ?? raza?.EspecieId ?? raza?.especie_id ?? null;
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
   MODAL
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
   RENDERIZADO DE SELECTS
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

  especies.forEach((especie) => {
    const option = document.createElement("option");
    option.value = obtenerId(especie);
    option.textContent = obtenerNombre(especie);
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
  if (!idEspecie) {
    renderizarRazasFiltradas([]);
    return;
  }

  const razasFiltradas = cacheRazas.filter((raza) => {
    return Number(obtenerEspecieIdDeRaza(raza)) === Number(idEspecie);
  });

  renderizarRazasFiltradas(razasFiltradas);
}

/* =========================================================
   CARGA DE DATOS
========================================================= */

async function cargarPropietarios() {
  const respuesta = await fetch(`${URL_API}/api/propetarios`, {
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

  const especieSeleccionada = selectEspecie.value;
  if (especieSeleccionada) {
    filtrarRazasPorEspecie(especieSeleccionada);
  } else {
    renderizarRazasFiltradas([]);
  }
}

async function cargarDatosInicialesModal() {
  try {
    await Promise.all([
      cargarPropietarios(),
      cargarEspecies(),
      cargarRazas()
    ]);
  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message || "Ocurrió un error al cargar los datos del formulario.");
  }
}

/* =========================================================
   NUEVA ESPECIE / NUEVA RAZA
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
   CAMBIO DE ESPECIE
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
   CREAR ESPECIE / RAZA
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
   GUARDAR MASCOTA
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

  } catch (error) {
    console.error(error);
    mostrarMensaje(error.message || "Ocurrió un error al guardar la mascota.");
  } finally {
    cambiarEstadoBotonGuardar(false);
  }
});