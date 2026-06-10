// ============================================================
//  JS: citas — editar + crear + cancelar (CORREGIDO)
//  Cambios:
//    1. Select mascota usa `readonly` visual pero campo hidden
//       para que el valor sí se envíe en el submit.
//    2. cargarSelectConValor usa el campo correcto de la API
//       de veterinarios (Nombre_Usuario).
//    3. FechaHora se construye sin desfase de zona horaria.
//    4. Headers de autorización incluidos en todos los fetch.
// ============================================================

const API_URL = `${window.API_URL}/api/citas`;

function obtenerToken() {
    return localStorage.getItem("token") || "";
}

function headersAuth() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${obtenerToken()}`
    };
}

// ── Cargar tabla de citas ──────────────────────────────────────
async function cargarCitas() {
    try {
        const filtro = document.getElementById("filtroEstado")?.value || "todos";
        const res = await fetch(API_URL, { headers: headersAuth() });
        if (!res.ok) throw new Error("Error al cargar citas");
        const json = await res.json();
        let citas = Array.isArray(json) ? json : (json.data ?? []);

        if (filtro !== "todos") {
            citas = citas.filter(c => (c.Estado || "").toLowerCase().includes(filtro.toLowerCase()));
        }

        const tbody = document.getElementById("tablaCitas");
        const tabla = document.getElementById("contenedorTabla");
        if (!tbody) return;

        tabla?.classList.remove("hidden");

        if (citas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No hay citas registradas.</td></tr>`;
            return;
        }

        tbody.innerHTML = citas.map(c => {
            const fechaHora   = new Date(c.FechaHora);
            const fecha       = fechaHora.toLocaleDateString("es-SV");
            const hora        = fechaHora.toTimeString().slice(0, 5);
            const estadoTexto = (c.Estado || "").toLowerCase();

            let claseEstado = "", textoEstado = "";
            if      (estadoTexto.includes("pendiente"))                               { claseEstado = "estado-pendiente";  textoEstado = "Pendiente";  }
            else if (estadoTexto.includes("curso") || estadoTexto.includes("activa")) { claseEstado = "estado-encurso";    textoEstado = "En Curso";   }
            else if (estadoTexto.includes("cancel"))                                  { claseEstado = "estado-cancelada";  textoEstado = "Cancelada";  }
            else if (estadoTexto.includes("complet"))                                 { claseEstado = "estado-completada"; textoEstado = "Completada"; }
            else { textoEstado = c.Estado || "—"; }

            return `
                <tr>
                    <td data-label="ID">${c.IdCita}</td>
                    <td data-label="Mascota" style="font-weight:600;">${c.Mascota ?? "—"}</td>
                    <td data-label="Fecha">${fecha}</td>
                    <td data-label="Hora">${hora}</td>
                    <td data-label="Estado">
                        <span class="badge-estado ${claseEstado}">${textoEstado}</span>
                    </td>
                    <td data-label="Acciones">
                        <div class="acciones-container">
                            <button class="btn-tabla btn-editar-tabla"   onclick="abrirEditarCita(${c.IdCita})">Editar</button>
                            <button class="btn-tabla btn-cancelar-tabla" onclick="abrirCancelarCita(${c.IdCita})">Cancelar</button>
                        </div>
                    </td>
                </tr>`;
        }).join("");
    } catch (err) {
        console.error("Error:", err);
    }
}

// ── Helper: poblar un select y preseleccionar valor ────────────
async function cargarSelectConValor(selectId, url, campoId, campoTexto, placeholder, idSeleccionado) {
    const select = document.getElementById(selectId);
    if (!select) return;
 
    select.innerHTML = `<option value="">${placeholder}</option>`;
 
    try {
        const res   = await fetch(url, { headers: headersAuth() });
        const json  = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
 
        items.forEach(item => {
            // Buscar el id con cualquier casing: "Id", "id", "ID"
            const val = item[campoId]
                     ?? item[campoId.toLowerCase()]
                     ?? item[campoId.toUpperCase()]
                     ?? item["id"]
                     ?? item["Id"]
                     ?? item["ID"];
 
            // Buscar el texto con cualquier casing
            const text = item[campoTexto]
                      ?? item[campoTexto.toLowerCase()]
                      ?? String(val);
 
            if (val == null) return; // skip si no encontró id
 
            const opt = document.createElement("option");
            opt.value       = String(val);
            opt.textContent = text;
            select.appendChild(opt);
        });
 
        // Preseleccionar DESPUÉS de poblar
        if (idSeleccionado != null && idSeleccionado !== undefined) {
            select.value = String(idSeleccionado);
 
            if (select.value !== String(idSeleccionado)) {
                console.warn(`⚠️ [${selectId}] No matcheó id=${idSeleccionado}. Opciones:`,
                    Array.from(select.options).map(o => `${o.value}="${o.text}"`)
                );
            } else {
                console.log(`✅ [${selectId}] Preseleccionado → ${idSeleccionado}`);
            }
        }
 
    } catch (err) {
        console.warn(`No se pudo cargar ${url}:`, err.message);
    }
}
 

// ── ABRIR MODAL EDITAR ─────────────────────────────────────────
async function abrirEditarCita(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { headers: headersAuth() });
        if (!res.ok) throw new Error("No se pudo obtener la cita");

        const json = await res.json();
        const cita = json.data ?? json;

        console.log("📋 Datos de la cita:", cita);

        // ── Campos básicos ──────────────────────────────────
        const fechaHora = new Date(cita.FechaHora);
        document.getElementById("editIdCita").value = cita.IdCita;

        // Fecha y hora locales sin desfase UTC
        const yyyy  = fechaHora.getFullYear();
        const mm    = String(fechaHora.getMonth() + 1).padStart(2, "0");
        const dd    = String(fechaHora.getDate()).padStart(2, "0");
        const hh    = String(fechaHora.getHours()).padStart(2, "0");
        const min   = String(fechaHora.getMinutes()).padStart(2, "0");

        document.getElementById("editFecha").value = `${yyyy}-${mm}-${dd}`;
        document.getElementById("editHora").value  = `${hh}:${min}`;

        // ── IDs de los campos relacionados ─────────────────
        const idMascota = cita.Id_Mascota     ?? cita.IdMascota     ?? cita.id_mascota;
        const idVet     = cita.Id_Veterinario ?? cita.IdVeterinario ?? cita.id_veterinario;
        const idTipo    = cita.IdTipoConsulta ?? cita.Id_TipoConsulta;
        const idEstado  = cita.IdEstadoCita   ?? cita.Id_EstadoCita;
        const nombreMascota = cita.Mascota ?? "Mascota";

        console.log("🔑 IDs → Mascota:", idMascota, "| Vet:", idVet, "| Tipo:", idTipo, "| Estado:", idEstado);

        // ── FIX: mascota — mostrar nombre visualmente pero
        //    guardar el ID en un campo hidden para que el
        //    submit siempre lo reciba aunque el select esté
        //    deshabilitado visualmente ───────────────────────
        const selectMascota = document.getElementById("editMascota");
        if (selectMascota) {
            selectMascota.innerHTML = `<option value="${idMascota}">${nombreMascota}</option>`;
            selectMascota.value     = idMascota;
            // Usar pointer-events:none en lugar de disabled
            // para que el value sí se incluya en el submit
            selectMascota.style.pointerEvents = "none";
            selectMascota.style.opacity       = "0.6";
        }

        // Si hay un campo hidden de respaldo, asignarlo también
        const hiddenMascota = document.getElementById("editMascotaHidden");
        if (hiddenMascota) hiddenMascota.value = idMascota;

        // ── Cargar selects de veterinario, tipo y estado ────
        await Promise.all([
            cargarSelectConValor(
                "editVeterinario",
                `${window.API_URL}/api/usuarios/veterinarios`,
                "Id",            // campo id
                "Nombre_Usuario", // campo texto  ← FIX: era "Nombre"
                "Seleccione Veterinario",
                idVet
            ),
            cargarSelectConValor(
                "editTipoConsulta",
                `${window.API_URL}/api/tipoConsulta`,
                "Id",
                "Tipo_Consulta",
                "Seleccione Tipo",
                idTipo
            ),
            cargarSelectConValor(
                "editEstado",
                `${window.API_URL}/api/estadocita`,
                "Id",
                "Estado",
                "Seleccione Estado",
                idEstado
            ),
        ]);

        // ── Fallback: si el select de veterinario no quedó
        //    seleccionado, buscar por nombre ─────────────────
        const selectVet = document.getElementById("editVeterinario");
        if (selectVet && (!idVet || selectVet.value === "")) {
            const nombreVet = (cita.Veterinario ?? "").trim().toLowerCase();
            const opcion = Array.from(selectVet.options).find(
                opt => opt.text.trim().toLowerCase() === nombreVet
            );
            if (opcion) selectVet.value = opcion.value;
        }

        document.getElementById("modalEditarCita").classList.remove("hidden");

    } catch (err) {
        console.error("Error al abrir editar:", err);
        mostrarAlerta("No se pudo cargar la cita para editar.");
    }
}

// ── GUARDAR EDICIÓN ────────────────────────────────────────────
// ============================================================
//  FIX: submit de formEditarCita
//  Reemplaza el addEventListener("submit") que tienes actualmente
// ============================================================
 
document.getElementById("formEditarCita")?.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const id      = document.getElementById("editIdCita").value;
 
    // FIX: leer cada select con log para ver qué valor tiene en el momento del submit
    const selectVet    = document.getElementById("editVeterinario");
    const selectTipo   = document.getElementById("editTipoConsulta");
    const selectEstado = document.getElementById("editEstado");
    const selectMascota = document.getElementById("editMascota");
    const hiddenMascota = document.getElementById("editMascotaHidden");
 
    const mascota = hiddenMascota?.value || selectMascota?.value;
    const vet     = selectVet?.value;
    const tipo    = selectTipo?.value;
    const estado  = selectEstado?.value;
    const fecha   = document.getElementById("editFecha").value;
    const hora    = document.getElementById("editHora").value;
 
    // Log para ver exactamente qué tiene cada select al momento de guardar
    console.log("📋 Estado de selects al hacer submit:", {
        mascota,
        vet,           // ← si esto es "" o undefined, el select no quedó poblado
        tipo,
        estado,
        fecha,
        hora,
        // Opciones disponibles en el select de veterinario
        opcionesVet: Array.from(selectVet?.options ?? []).map(o => `[${o.value}] ${o.text}`)
    });
 
    if (!mascota || !vet || !tipo || !estado || !fecha || !hora) {
        mostrarAlerta(`Por favor completa todos los campos. Faltante: ${
            [!mascota && "Mascota", !vet && "Veterinario", !tipo && "Tipo",
             !estado && "Estado", !fecha && "Fecha", !hora && "Hora"]
            .filter(Boolean).join(", ")
        }`);
        return;
    }
 
    const data = {
        Id_Mascota:     parseInt(mascota),
        Id_Veterinario: parseInt(vet),
        IdTipoConsulta: parseInt(tipo),
        IdEstadoCita:   parseInt(estado),
        FechaHora:      `${fecha}T${hora}:00`
    };
 
    console.log("📤 JSON enviado al PUT:", JSON.stringify(data));
 
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method:  "PUT",
            headers: headersAuth(),
            body:    JSON.stringify(data)
        });
 
        const json = await res.json();
        console.log("📥 Respuesta del servidor:", json);
 
        if (res.ok) {
            document.getElementById("modalEditarCita").classList.add("hidden");
            mostrarExito("¡Cita actualizada correctamente!");
            cargarCitas();
        } else {
            mostrarAlerta("Error al actualizar: " + (json.message || res.statusText));
        }
    } catch (err) {
        mostrarAlerta("Error de conexión al actualizar.");
        console.error(err);
    }
});

// ── CANCELAR CITA ──────────────────────────────────────────────
let citaACancelar = null;

function abrirCancelarCita(id) {
    citaACancelar = id;
    const input = document.getElementById("motivoCancelacion");
    if (input) input.value = "";
    document.getElementById("modalCancelar").classList.remove("hidden");
}

document.getElementById("confirmarCancelar")?.addEventListener("click", async () => {
    if (!citaACancelar) return;
    try {
        const motivo = document.getElementById("motivoCancelacion")?.value.trim() || "";
        const res = await fetch(`${API_URL}/${citaACancelar}/estado`, {
            method:  "PATCH",
            headers: headersAuth(),
            body:    JSON.stringify({ IdEstadoCita: 3, Motivo: motivo })
        });
        if (res.ok) {
            document.getElementById("modalCancelar").classList.add("hidden");
            citaACancelar = null;
            mostrarExito("Cita cancelada correctamente.");
            cargarCitas();
        } else {
            mostrarAlerta("No se pudo cancelar la cita.");
        }
    } catch (err) {
        mostrarAlerta("Error de conexión al cancelar.");
    }
});

// ── CERRAR MODALES ─────────────────────────────────────────────
document.getElementById("cerrarEditarModal")?.addEventListener("click",    () => document.getElementById("modalEditarCita").classList.add("hidden"));
document.getElementById("cerrarEditarModalBtn")?.addEventListener("click", () => document.getElementById("modalEditarCita").classList.add("hidden"));
document.getElementById("cerrarCancelar")?.addEventListener("click",       () => { document.getElementById("modalCancelar").classList.add("hidden"); citaACancelar = null; });
document.getElementById("cerrarCancelarBtn")?.addEventListener("click",    () => { document.getElementById("modalCancelar").classList.add("hidden"); citaACancelar = null; });
document.getElementById("cerrarExito")?.addEventListener("click",          () => document.getElementById("modalExito")?.classList.add("hidden"));

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            if (modal.id === "modalCancelar") citaACancelar = null;
        }
    });
});

// ── FILTRO ─────────────────────────────────────────────────────
document.getElementById("filtroEstado")?.addEventListener("change", cargarCitas);

// ── ALERTAS (por si no vienen del otro archivo) ────────────────
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

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const filtro = document.getElementById("filtroEstado");
    if (filtro) filtro.value = "todos";
    cargarCitas();
});

window.abrirEditarCita   = abrirEditarCita;
window.abrirCancelarCita = abrirCancelarCita;
window.mostrarExito      = mostrarExito;
window.mostrarAlerta     = mostrarAlerta;