const API_URL = "http://localhost:3000/api/citas";

async function cargarCitas() {
    const filtro = document.getElementById("filtroEstado")?.value || "todos";
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Sin respuesta del servidor");
        let citas = await res.json();
        const tbody = document.getElementById("tablaCitas");
        const tabla = document.getElementById("contenedorTabla");
        if (!tbody || !tabla) return;
        tabla.classList.remove("hidden");
        if (filtro !== "todos") citas = citas.filter(c => c.Estado === filtro);
        tbody.innerHTML = "";
        if (citas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#888;">No hay citas para mostrar.</td></tr>`;
            return;
        }
        citas.forEach(cita => {
            const fechaObj = new Date(cita.FechaHora);
            const mapaClases = { "Pendiente":"pendiente","En Curso":"encurso","Cancelada":"cancelada","Completada":"completada" };
            const estadoClase = mapaClases[cita.Estado] || "pendiente";
            tbody.innerHTML += `
                <tr>
                    <td>${cita.IdCita}</td>
                    <td><strong>${cita.Mascota ?? ""}</strong></td>
                    <td>${fechaObj.toLocaleDateString()}</td>
                    <td>${fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span class="badge-estado estado-${estadoClase}">${cita.Estado}</span></td>
                    <td>
                        <div class="acciones-container">
                            <button class="btn-tabla btn-editar-tabla"  onclick="abrirEditarCita(${cita.IdCita})">Editar</button>
                            <button class="btn-tabla btn-cancelar-tabla" onclick="abrirCancelarCita(${cita.IdCita})">Cancelar</button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Error:", err);
        const tbody = document.getElementById("tablaCitas");
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color:red;text-align:center;padding:20px;">Error al cargar datos.</td></tr>`;
    }
}

async function cargarSelect(selectId, url, placeholder, idSeleccionado = null, fallbackFn = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
        items.forEach(item => {
            const val  = item.Id   ?? item.id;
            const text = item.Nombre ?? item.nombre ?? item.NombreCompleto ?? val;
            select.innerHTML += `<option value="${val}" ${val == idSeleccionado ? "selected" : ""}>${text}</option>`;
        });
    } catch (err) {
        console.warn(`No se pudo cargar ${url}:`, err.message);
        if (fallbackFn) fallbackFn(select, idSeleccionado);
    }
}

function fallbackVets(select, idSel) {
    select.innerHTML = `
        <option value="1" ${idSel==1?"selected":""}>Dr. García</option>
        <option value="2" ${idSel==2?"selected":""}>Dra. Martínez</option>
        <option value="3" ${idSel==3?"selected":""}>Dr. Ramos</option>`;
}

function fallbackTipos(select, idSel) {
    select.innerHTML = `
        <option value="1" ${idSel==1?"selected":""}>Consulta General</option>
        <option value="2" ${idSel==2?"selected":""}>Vacunación</option>
        <option value="3" ${idSel==3?"selected":""}>Cirugía</option>
        <option value="4" ${idSel==4?"selected":""}>Control</option>
        <option value="5" ${idSel==5?"selected":""}>Urgencia</option>`;
}

async function abrirEditarCita(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener la cita");
        const cita = await res.json();

        document.getElementById("editIdCita").value = cita.IdCita;
        const fechaHora = new Date(cita.FechaHora);
        document.getElementById("editFecha").value = fechaHora.toISOString().split("T")[0];
        document.getElementById("editHora").value  = fechaHora.toTimeString().slice(0, 5);

        await Promise.all([
            cargarSelect("editMascota",      "http://localhost:3000/api/mascotas",       "Seleccionar...", cita.Id_Mascota),
            cargarSelect("editVeterinario",  "http://localhost:3000/api/veterinarios",   "Seleccionar...", cita.Id_Veterinario, fallbackVets),
            cargarSelect("editTipoConsulta", "http://localhost:3000/api/tipos-consulta", "Seleccionar...", cita.IdTipoConsulta,  fallbackTipos),
        ]);

        const selectEstado = document.getElementById("editEstado");
        if (selectEstado && cita.IdEstadoCita) selectEstado.value = cita.IdEstadoCita;

        document.getElementById("modalEditarCita").classList.remove("hidden");
    } catch (err) {
        console.error("Error abriendo editar:", err);
        if (typeof mostrarAlerta === "function") mostrarAlerta("No se pudo cargar la cita para editar.");
    }
}

document.getElementById("formEditarCita")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id     = document.getElementById("editIdCita").value;
    const mascota = document.getElementById("editMascota").value;
    const vet    = document.getElementById("editVeterinario").value;
    const tipo   = document.getElementById("editTipoConsulta").value;
    const estado = document.getElementById("editEstado").value;
    const fecha  = document.getElementById("editFecha").value;
    const hora   = document.getElementById("editHora").value;

    if (!mascota || !vet || !tipo || !estado || !fecha || !hora) {
        if (typeof mostrarAlerta === "function") mostrarAlerta("Por favor completa todos los campos obligatorios.");
        return;
    }

    const data = {
        Id_Mascota: parseInt(mascota), Id_Veterinario: parseInt(vet),
        IdTipoConsulta: parseInt(tipo), IdEstadoCita: parseInt(estado),
        FechaHora: `${fecha}T${hora}:00`
    };

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        if (res.ok) {
            document.getElementById("modalEditarCita").classList.add("hidden");
            if (typeof mostrarExito === "function") mostrarExito("¡Cita actualizada correctamente!");
            cargarCitas();
        } else {
            const err = await res.json();
            if (typeof mostrarAlerta === "function") mostrarAlerta("Error: " + (err.message || JSON.stringify(err)));
        }
    } catch (err) {
        if (typeof mostrarAlerta === "function") mostrarAlerta("Error de conexión al actualizar.");
    }
});

function cerrarModalEditar() { document.getElementById("modalEditarCita").classList.add("hidden"); }
document.getElementById("cerrarEditarModal")?.addEventListener("click", cerrarModalEditar);
document.getElementById("cerrarEditarModalBtn")?.addEventListener("click", cerrarModalEditar);

let citaACancelar = null;

function abrirCancelarCita(id) {
    citaACancelar = id;
    document.getElementById("motivoCancelacion").value = "";
    document.getElementById("modalCancelar").classList.remove("hidden");
}

document.getElementById("confirmarCancelar")?.addEventListener("click", async () => {
    if (!citaACancelar) return;
    const motivo = document.getElementById("motivoCancelacion").value.trim();
    try {
        const res = await fetch(`${API_URL}/${citaACancelar}/estado`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ IdEstadoCita: 3, Motivo: motivo })
        });
        if (res.ok) {
            document.getElementById("modalCancelar").classList.add("hidden");
            citaACancelar = null;
            if (typeof mostrarExito === "function") mostrarExito("Cita cancelada correctamente.");
            cargarCitas();
        } else {
            if (typeof mostrarAlerta === "function") mostrarAlerta("No se pudo cancelar la cita.");
        }
    } catch (err) {
        if (typeof mostrarAlerta === "function") mostrarAlerta("Error de conexión al cancelar.");
    }
});

function cerrarModalCancelar() { document.getElementById("modalCancelar").classList.add("hidden"); citaACancelar = null; }
document.getElementById("cerrarCancelar")?.addEventListener("click", cerrarModalCancelar);
document.getElementById("cerrarCancelarBtn")?.addEventListener("click", cerrarModalCancelar);

document.getElementById("cerrarExito")?.addEventListener("click", () => {
    document.getElementById("modalExito").classList.add("hidden");
});

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            if (modal.id === "modalCancelar") citaACancelar = null;
        }
    });
});

document.getElementById("filtroEstado")?.addEventListener("change", cargarCitas);

window.cargarCitas       = cargarCitas;
window.abrirEditarCita   = abrirEditarCita;
window.abrirCancelarCita = abrirCancelarCita;

document.addEventListener("DOMContentLoaded", cargarCitas);