const API_URL = "http://localhost:3000";

const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");

let usuariosCache = [];

function escapeHtml(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function estadoBadge(activo) {
    const isActive = Number(activo) === 1;
    return isActive
        ? `<span class="badge badge-active">Activo</span>`
        : `<span class="badge badge-inactive">Inactivo</span>`;
}

function renderUsuarios(lista) {
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  tbody.innerHTML = lista.map(u => {
    const esActivo = Number(u.activo) === 1;

return `
<tr class="${esActivo ? "" : "inactive"}">
  <td>${escapeHtml(u.id)}</td>
  <td>${escapeHtml(u.Nombre_Usuario)}</td>
  <td>${escapeHtml(u.Correo)}</td>
  <td>${escapeHtml(u.Nombre_Rol)}</td>
  <td>${estadoBadge(u.activo)}</td>
  <td class="actions-col">
    <button
      class="btn btn-edit btn-open-edit"
      type="button"
      data-id="${escapeHtml(u.id)}"
      data-usuario="${escapeHtml(u.Nombre_Usuario)}"
      data-correo="${escapeHtml(u.Correo)}"
      data-rolnombre="${escapeHtml(u.Nombre_Rol)}"
    >Editar</button>

    <button class="btn ${esActivo ? "btn-delete" : "btn-activate"} btn-toggle" data-id="${escapeHtml(u.id)}">
      ${esActivo ? "Desactivar" : "Activar"}
    </button>
  </td>
</tr>
`;
  }).join("");
}

function aplicarFiltro() {
    const q = searchInput.value.trim().toLowerCase();

    if (!q) {
        renderUsuarios(usuariosCache);
        return;
    }

    const filtrados = usuariosCache.filter((u) => {
        const usuario = (u.Nombre_Usuario ?? "").toLowerCase();
        const correo = (u.Correo ?? "").toLowerCase();
        const rol = (u.Nombre_Rol ?? "").toLowerCase();
        return usuario.includes(q) || correo.includes(q) || rol.includes(q);
    });

    renderUsuarios(filtrados);
}

async function cargarUsuarios() {
    try {
        const res = await fetch(`${API_URL}/api/usuarios`);
        const json = await res.json();

        if (!res.ok || !json.success) {
        throw new Error(json.message || "Error al obtener usuarios");
        }

        usuariosCache = Array.isArray(json.data) ? json.data : [];
        aplicarFiltro();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        usuariosCache = [];
        renderUsuarios([]);
        emptyMsg.style.display = "block";
        emptyMsg.textContent =
        "No se pudo cargar usuarios.";
    }
}

searchInput.addEventListener("input", aplicarFiltro);

//al cargar la página
cargarUsuarios();

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-toggle");
  if (!btn) return;

  const id = btn.dataset.id;

  try {

    const res = await fetch(`${API_URL}/api/usuarios/${id}/toggle`, {
      method: "PATCH",
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Error al cambiar estado del usuario");
    }

    alert(json.message || "Estado del usuario actualizado");

    cargarUsuarios();

  } catch (error) {

    console.error(error);
    alert("No se pudo cambiar el estado del usuario");

  }
});

// ======= ROLES (ajusta IDs según tu BD) =======
// Si tus roles son más, agrega más aquí.
const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Veterinario" }, 
  { id: 3, nombre: "Recepcionista" },
];

// Crea el modal una vez
const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";
modalOverlay.innerHTML = `
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-header">
      <h3 id="modal-title">Editar usuario</h3>
      <button class="modal-close" type="button" aria-label="Cerrar">✕</button>
    </div>

    <form id="editUserForm">
      <div class="modal-body">

        <input type="hidden" id="editId" />

        <div class="form-row">
          <label for="editNombre">Nombre de usuario</label>
          <input id="editNombre" type="text" required />
        </div>

        <div class="form-row">
          <label for="editCorreo">Correo</label>
          <input id="editCorreo" type="email" required />
        </div>

        <div class="form-row">
          <label for="editContrasena">Contraseña</label>
          <input id="editContrasena" type="password" placeholder="Dejar vacío para no cambiar" />
          <div class="form-hint">Por seguridad no se muestra la contraseña actual. Escribe solo si deseas cambiarla.</div>
        </div>

        <div class="form-row">
          <label for="editRol">Rol</label>
          <select id="editRol" required></select>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" id="btnCancelEdit">Cancelar</button>
        <button class="btn btn-save" type="submit" id="btnSaveEdit">Aplicar cambios</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(modalOverlay);

const editForm = document.getElementById("editUserForm");
const btnCancelEdit = document.getElementById("btnCancelEdit");
const btnClose = modalOverlay.querySelector(".modal-close");

const editId = document.getElementById("editId");
const editNombre = document.getElementById("editNombre");
const editCorreo = document.getElementById("editCorreo");
const editContrasena = document.getElementById("editContrasena");
const editRol = document.getElementById("editRol");

function openModal() {
  modalOverlay.classList.add("show");
  // foco al primer campo
  setTimeout(() => editNombre.focus(), 0);
}

function closeModal() {
  modalOverlay.classList.remove("show");
  editForm.reset();
  editId.value = "";
}

// Cerrar modal: click fuera, X, cancelar, Esc
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
btnCancelEdit.addEventListener("click", closeModal);
btnClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) closeModal();
});

// Render roles en select
function fillRolesSelect(selectedRolNombre) {
  editRol.innerHTML = ROLES.map(r => {
    const selected = (r.nombre.toLowerCase() === (selectedRolNombre ?? "").toLowerCase()) ? "selected" : "";
    return `<option value="${r.id}" ${selected}>${r.nombre}</option>`;
  }).join("");

  // Si no encontró match por nombre, selecciona el primero
  if (!editRol.value && ROLES.length) editRol.value = String(ROLES[0].id);
}

// Abrir modal al click en Editar (delegación)
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-open-edit");
  if (!btn) return;

  const id = btn.dataset.id;
  const usuario = btn.dataset.usuario;
  const correo = btn.dataset.correo;
  const rolNombre = btn.dataset.rolnombre;

  editId.value = id;
  editNombre.value = usuario ?? "";
  editCorreo.value = correo ?? "";
  editContrasena.value = ""; // siempre vacío
  fillRolesSelect(rolNombre);

  openModal();
});

// Submit del modal: PUT /api/usuarios/:id
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = editId.value;
    const payload = {
    nombre_usuario: editNombre.value.trim(),
    correo: editCorreo.value.trim(),
    rolId: Number(editRol.value),
    };

    // contraseña (misma llave que en crear-usuario)
    const pass = editContrasena.value.trim();
    if (pass.length > 0) payload.contrasena = pass;

  const btnSave = document.getElementById("btnSaveEdit");
  btnSave.disabled = true;
  btnSave.textContent = "Guardando...";

  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.success === false) {
      throw new Error(json.message || `Error HTTP ${res.status}`);
    }

    alert(json.message || "Usuario actualizado");
    closeModal();
    await cargarUsuarios();
  } catch (err) {
    console.error(err);
    alert(err.message || "No se pudo actualizar el usuario");
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = "Aplicar cambios";
  }
});

// recarga en tiempo real cada 5 seg
setInterval(cargarUsuarios, 5000);
