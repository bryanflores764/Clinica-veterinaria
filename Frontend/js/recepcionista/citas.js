const API_URL = "http://localhost:3000/api/citas";

// ── Cargar tabla de citas ──────────────────────────────────────
async function cargarCitas() {
  try {
    const filtro = document.getElementById("filtroEstado")?.value || "todos";
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al cargar citas");
    const json = await res.json();
    let citas = Array.isArray(json) ? json : (json.data ?? []);

    if (filtro !== "todos") {
      citas = citas.filter(c => (c.Estado || "").toLowerCase().includes(filtro.toLowerCase()));
    }

    const tbody = document.getElementById("tablaCitas");
    const tabla = document.getElementById("contenedorTabla");
    if (!tbody) return;

    if (citas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No hay citas registradas.</td></tr>`;
      tabla?.classList.remove("hidden");
      return;
    }

    tabla?.classList.remove("hidden");
    tbody.innerHTML = citas.map(c => {
      const fechaHora = new Date(c.FechaHora);
      const fecha = fechaHora.toLocaleDateString("es-SV");
      const hora  = fechaHora.toTimeString().slice(0, 5);
      const estadoTexto = (c.Estado || "").toLowerCase();

      let claseEstado = "", textoEstado = "";
      if      (estadoTexto.includes("pendiente"))                          { claseEstado = "estado-pendiente";  textoEstado = "Pendiente";  }
      else if (estadoTexto.includes("curso") || estadoTexto.includes("activa")) { claseEstado = "estado-encurso";   textoEstado = "En Curso";   }
      else if (estadoTexto.includes("cancel"))                             { claseEstado = "estado-cancelada";  textoEstado = "Cancelada";  }
      else if (estadoTexto.includes("complet"))                            { claseEstado = "estado-completada"; textoEstado = "Completada"; }
      else { textoEstado = c.Estado || "—"; }

    return `
  <tr>
    <td data-label="ID">${c.IdCita}</td>

    <td data-label="Mascota" style="font-weight:600;">
      ${c.Mascota ?? c.NombreMascota ?? "—"}
    </td>

    <td data-label="Fecha">${fecha}</td>

    <td data-label="Hora">${hora}</td>

    <td data-label="Estado">
      <span class="badge-estado ${claseEstado}">
        ${textoEstado}
      </span>
    </td>

    <td data-label="Acciones">
      <div class="acciones-container">
        <button class="btn-tabla btn-editar-tabla"
          onclick="abrirEditarCita(${c.IdCita})">
          Editar
        </button>

        <button class="btn-tabla btn-cancelar-tabla"
          onclick="abrirCancelarCita(${c.IdCita})">
          Cancelar
        </button>
      </div>
    </td>
  </tr>`;
    }).join("");
  } catch (err) {
    console.error("Error:", err);
  }
}

// ── Helper: carga un select y asigna el valor seleccionado ────
async function cargarSelectConValor(selectId, url, campoId, campoTexto, placeholder, idSeleccionado) {
  const select = document.getElementById(selectId);
  if (!select) return;
  try {
    const res   = await fetch(url);
    const json  = await res.json();
    const items = Array.isArray(json) ? json : (json.data ?? []);
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
      const val  = item[campoId];
      const text = item[campoTexto];
      select.innerHTML += `<option value="${val}">${text}</option>`;
    });
  } catch (err) {
    console.warn(`No se pudo cargar ${url}:`, err.message);
  }
  // Asignar DESPUÉS de poblar opciones
  if (idSeleccionado != null) select.value = idSeleccionado;
}

// ── ABRIR MODAL EDITAR ─────────────────────────────────────────
async function abrirEditarCita(id) {
  try {
    const res  = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener la cita");

    const cita = await res.json();
    console.log("📋 Datos de la cita:", cita);

    const fechaHora = new Date(cita.FechaHora);

    document.getElementById("editIdCita").value = cita.IdCita;
    document.getElementById("editFecha").value  = fechaHora.toISOString().split("T")[0];
    document.getElementById("editHora").value   = fechaHora.toTimeString().slice(0, 5);

    // 🔑 Detectar IDs
    const idMascota = cita.Id_Mascota ?? cita.IdMascota ?? cita.id_mascota;
    const idVet     = cita.Id_Veterinario ?? cita.IdVeterinario ?? cita.id_veterinario;
    const idTipo    = cita.IdTipoConsulta ?? cita.Id_TipoConsulta ?? cita.idTipoConsulta;
    const idEstado  = cita.IdEstadoCita ?? cita.Id_EstadoCita ?? cita.idEstadoCita;

    console.log("🔑 IDs → Mascota:", idMascota, "| Vet:", idVet, "| Tipo:", idTipo, "| Estado:", idEstado);

    // 🔥 MASCOTA (bloqueada)
    const selectMascota = document.getElementById("editMascota");
    selectMascota.innerHTML = `
      <option value="${idMascota}">
        ${cita.Mascota ?? cita.NombreMascota ?? "Mascota"}
      </option>
    `;
    selectMascota.disabled = true;

    // 🔥 Cargar los demás selects normal
    await Promise.all([
      cargarSelectConValor(
        "editVeterinario",
        "http://localhost:3000/api/usuarios/veterinarios",
        "Id",
        "Nombre_Usuario",
        "Seleccione Veterinario",
        idVet
      ),
      cargarSelectConValor(
        "editTipoConsulta",
        "http://localhost:3000/api/tipoConsulta",
        "Id",
        "Tipo_Consulta",
        "Seleccione Tipo",
        idTipo
      ),
      cargarSelectConValor(
        "editEstado",
        "http://localhost:3000/api/estadocita",
        "Id",
        "Estado",
        "Seleccione Estado",
        idEstado
      ),
    ]);

    document.getElementById("modalEditarCita").classList.remove("hidden");

  } catch (err) {
    console.error("Error al abrir editar:", err);
    alert("No se pudo cargar la cita para editar.");
  }
}
// ── GUARDAR EDICIÓN ────────────────────────────────────────────
document.getElementById("formEditarCita")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id      = document.getElementById("editIdCita").value;
  const mascota = document.getElementById("editMascota").value;
  const vet     = document.getElementById("editVeterinario").value;
  const tipo    = document.getElementById("editTipoConsulta").value;
  const estado  = document.getElementById("editEstado").value;
  const fecha   = document.getElementById("editFecha").value;
  const hora    = document.getElementById("editHora").value;

  // 🔍 Log para ver qué se envía al backend
  console.log("📦 Enviando al PUT:", { id, mascota, vet, tipo, estado, fecha, hora });

  if (!mascota || !vet || !tipo || !estado || !fecha || !hora) {
    alert("⚠️ Por favor completa todos los campos antes de actualizar.");
    return;
  }

  const data = {
    Id_Mascota:     parseInt(mascota),
    Id_Veterinario: parseInt(vet),
    IdTipoConsulta: parseInt(tipo),
    IdEstadoCita:   parseInt(estado),
    FechaHora:      `${fecha}T${hora}:00`
  };

  console.log("📤 JSON enviado:", JSON.stringify(data));

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data)
    });

    if (res.ok) {
      document.getElementById("modalEditarCita").classList.add("hidden");
      const modalExito = document.getElementById("modalExito");
      if (modalExito) {
        const t = document.getElementById("exitoTitulo");
        const p = document.getElementById("exitoMensaje");
        if (t) t.textContent = "✅ Éxito";
        if (p) p.textContent = "¡Cita actualizada correctamente!";
        modalExito.classList.remove("hidden");
      } else {
        alert("✅ Cita actualizada correctamente.");
      }
      cargarCitas();
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("❌ Respuesta del servidor:", err);
      alert("❌ Error al actualizar: " + (err.message || res.statusText));
    }
  } catch (err) {
    alert("❌ Error de conexión al actualizar.");
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
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ IdEstadoCita: 3, Motivo: motivo })
    });
    if (res.ok) {
      document.getElementById("modalCancelar").classList.add("hidden");
      citaACancelar = null;
      cargarCitas();
    } else {
      alert("❌ No se pudo cancelar la cita.");
    }
  } catch (err) {
    alert("❌ Error de conexión al cancelar.");
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

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const filtro = document.getElementById("filtroEstado");
  if (filtro) filtro.value = "todos";
  cargarCitas();
});

window.abrirEditarCita   = abrirEditarCita;
window.abrirCancelarCita = abrirCancelarCita;