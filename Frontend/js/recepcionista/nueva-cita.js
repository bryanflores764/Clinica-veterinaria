const API_MASCOTAS      = `${window.API_URL}/api/mascotas`  ;
const API_VETERINARIOS  = `${window.API_URL}/api/usuarios/veterinarios`;
const API_TIPOS         = `${window.API_URL}/api/tipoConsulta`;
const API_CITAS_POST    = `${window.API_URL}/api/citas`;

// ── Abrir modal Nueva Cita ────────────────────────────────────
async function abrirNuevaCita() {
    document.getElementById("formCita").reset();

    const hoy = new Date().toISOString().split("T")[0];
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) inputFecha.min = hoy;

    await Promise.all([
        cargarSelectNueva("mascota",      API_MASCOTAS,     "Seleccionar mascota..."),
        cargarSelectVeterinario("veterinario",  API_VETERINARIOS, "Seleccionar veterinario..."),
        cargarSelectTipo("tipoConsulta",  API_TIPOS,        "Seleccionar tipo..."),
    ]);

    document.getElementById("modalCita").classList.remove("hidden");
}

// ── CARGAR SELECT GENERAL (mascotas, propietarios) ────────────
async function cargarSelectNueva(selectId, url, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
        items.forEach(item => {
            const val  = item.Id ?? item.id;
            const text = item.Nombre ?? item.nombre ?? item.NombreCompleto ?? val;
            select.innerHTML += `<option value="${val}">${text}</option>`;
        });
    } catch (err) {
        console.warn(`No se pudo cargar ${url}:`, err.message);
    }
}

// ── CARGAR SELECT VETERINARIOS (usa Nombre_Usuario) ───────────
async function cargarSelectVeterinario(selectId, url, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
        items.forEach(item => {
            const val  = item.Id ?? item.id;
            const text = item.Nombre_Usuario ?? item.NombreCompleto ?? item.Nombre ?? val;
            select.innerHTML += `<option value="${val}">${text}</option>`;
        });
    } catch (err) {
        console.warn(`No se pudo cargar veterinarios:`, err.message);
        select.innerHTML = `
            <option value="1">Dr. García</option>
            <option value="2">Dra. Martínez</option>
            <option value="3">Dr. Ramos</option>`;
    }
}

// ── CARGAR SELECT TIPO CONSULTA (usa Tipo_Consulta) ───────────
async function cargarSelectTipo(selectId, url, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
        items.forEach(item => {
            const val  = item.Id ?? item.id;
            const text = item.Tipo_Consulta ?? item.Nombre ?? val;
            select.innerHTML += `<option value="${val}">${text}</option>`;
        });
    } catch (err) {
        console.warn(`No se pudo cargar tipos de consulta:`, err.message);
        select.innerHTML = `
            <option value="1">Consulta General</option>
            <option value="2">Vacunación</option>
            <option value="3">Cirugía</option>
            <option value="4">Control</option>
            <option value="5">Urgencia</option>`;
    }
}

// ── GUARDAR CITA ──────────────────────────────────────────────
document.getElementById("formCita")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mascota = document.getElementById("mascota")?.value;
    const vet     = document.getElementById("veterinario")?.value;
    const tipo    = document.getElementById("tipoConsulta")?.value;
    const fecha   = document.getElementById("fecha")?.value;
    const hora    = document.getElementById("hora")?.value;

    if (!mascota || !vet || !tipo || !fecha || !hora) {
        mostrarAlerta("Por favor completa todos los campos obligatorios.");
        return;
    }

    const data = {
        Id_Mascota:     parseInt(mascota),
        Id_Veterinario: parseInt(vet),
        IdTipoConsulta: parseInt(tipo),
        IdEstadoCita:   1,
        FechaHora:      `${fecha}T${hora}:00`
    };

    try {
        const res = await fetch(API_CITAS_POST, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(data)
        });

        if (res.ok) {
            document.getElementById("modalCita").classList.add("hidden");
            mostrarExito("¡Nueva cita creada correctamente!");
            if (typeof cargarCitas === "function") cargarCitas();
        } else {
            const err = await res.json();
            mostrarAlerta("Error: " + (err.message || JSON.stringify(err)));
        }
    } catch (err) {
        mostrarAlerta("Error de conexión al guardar la cita.");
        console.error(err);
    }
});

// ── CERRAR MODAL ──────────────────────────────────────────────
function cerrarModalNueva() {
    document.getElementById("modalCita").classList.add("hidden");
}

document.getElementById("cerrarModal")?.addEventListener("click", cerrarModalNueva);
document.getElementById("cerrarModalBtn")?.addEventListener("click", cerrarModalNueva);

document.getElementById("btnNuevaCita")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirNuevaCita();
});

// ── ALERTAS ───────────────────────────────────────────────────
function mostrarExito(mensaje = "Operación realizada correctamente.") {
    const modal  = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p      = document.getElementById("exitoMensaje");
    const btn    = modal?.querySelector("button");

    if (titulo) titulo.textContent = "✅ Éxito";
    if (p)      p.textContent      = mensaje;
    if (btn)    btn.style.background = "#28a745";
    if (modal)  modal.classList.remove("hidden");
}

function mostrarAlerta(mensaje) {
    const modal  = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p      = document.getElementById("exitoMensaje");
    const btn    = modal?.querySelector("button");

    if (titulo) titulo.textContent = "⚠️ Atención";
    if (p)      p.textContent      = mensaje;
    if (btn)    btn.style.background = "#e67e22";
    if (modal)  modal.classList.remove("hidden");
}

window.abrirNuevaCita = abrirNuevaCita;
window.mostrarExito   = mostrarExito;
window.mostrarAlerta  = mostrarAlerta;