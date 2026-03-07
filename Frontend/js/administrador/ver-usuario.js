// ============================================================
//  Archivo: js/administrador/ver-usuario.js
// ============================================================

const API_URL = "http://localhost:3000";


//Referencias principales

const tbody = document.getElementById("users-tbody");
const emptyMsg = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");

let usuariosCache = [];


//Utilidades visuales
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


//Render de tabla

function renderUsuarios(lista) {
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  tbody.innerHTML = lista
    .map((u) => {
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
              data-activo="${escapeHtml(u.activo)}"
            >
              Editar
            </button>

            <button
              class="btn btn-delete btn-delete-user"
              type="button"
              data-id="${escapeHtml(u.id)}"
              data-usuario="${escapeHtml(u.Nombre_Usuario)}"
            >
              Eliminar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}


//Filtro de búsqueda

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


//Carga de usuarios

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
    emptyMsg.textContent = "No se pudo cargar usuarios.";
  }
}

searchInput.addEventListener("input", aplicarFiltro);


//Roles fijos para select

const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Veterinario" },
  { id: 3, nombre: "Recepcionista" },
];


//Modal de edición

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
          <div class="form-hint">
            Por seguridad no se muestra la contraseña actual. Escribe solo si deseas cambiarla.
          </div>
        </div>

        <div class="form-row">
          <label for="editRol">Rol</label>
          <select id="editRol" required></select>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" id="btnCancelEdit">Cancelar</button>
        <button class="btn btn-danger" type="button" id="btnToggleUser">Desactivar usuario</button>
        <button class="btn btn-save" type="submit" id="btnSaveEdit">Aplicar cambios</button>
      </div>
    </form>
  </div>
`;

document.body.appendChild(modalOverlay);


//Referencias del modal

const editForm = document.getElementById("editUserForm");
const btnCancelEdit = document.getElementById("btnCancelEdit");
const btnClose = modalOverlay.querySelector(".modal-close");
const btnToggleUser = document.getElementById("btnToggleUser");

const editId = document.getElementById("editId");
const editNombre = document.getElementById("editNombre");
const editCorreo = document.getElementById("editCorreo");
const editContrasena = document.getElementById("editContrasena");
const editRol = document.getElementById("editRol");


//Funciones del modal

function openModal() {
  modalOverlay.classList.add("show");
  setTimeout(() => editNombre.focus(), 0);
}

function closeModal() {
  modalOverlay.classList.remove("show");
  editForm.reset();
  editId.value = "";
  btnToggleUser.dataset.id = "";
  btnToggleUser.dataset.activo = "";
  btnToggleUser.textContent = "Desactivar usuario";
}

function fillRolesSelect(selectedRolNombre) {
  editRol.innerHTML = ROLES.map((r) => {
    const selected =
      r.nombre.toLowerCase() === (selectedRolNombre ?? "").toLowerCase()
        ? "selected"
        : "";

    return `<option value="${r.id}" ${selected}>${r.nombre}</option>`;
  }).join("");

  if (!editRol.value && ROLES.length) {
    editRol.value = String(ROLES[0].id);
  }
}


//Cierre del modal

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

btnCancelEdit.addEventListener("click", closeModal);
btnClose.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
    closeModal();
  }
});


//Eliminar usuario

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-delete-user");
  if (!btn) return;

  const id = btn.dataset.id;
  const usuario = btn.dataset.usuario;

  const confirmar = confirm(`¿Deseas eliminar al usuario "${usuario}"?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method: "DELETE",
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Error al eliminar el usuario");
    }

    alert(json.message || "Usuario eliminado correctamente");
    await cargarUsuarios();
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo eliminar el usuario");
  }
});


//Abrir modal de edición

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-open-edit");
  if (!btn) return;

  const id = btn.dataset.id;
  const usuario = btn.dataset.usuario;
  const correo = btn.dataset.correo;
  const rolNombre = btn.dataset.rolnombre;
  const activo = btn.dataset.activo;

  editId.value = id;
  editNombre.value = usuario ?? "";
  editCorreo.value = correo ?? "";
  editContrasena.value = "";

  fillRolesSelect(rolNombre);

  btnToggleUser.dataset.id = id;
  btnToggleUser.dataset.activo = activo;
  btnToggleUser.textContent =
    Number(activo) === 1 ? "Desactivar usuario" : "Activar usuario";

  openModal();
});


//   Editar usuario

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = editId.value;

  const payload = {
    nombre_usuario: editNombre.value.trim(),
    correo: editCorreo.value.trim(),
    rolId: Number(editRol.value),
  };

  const pass = editContrasena.value.trim();
  if (pass.length > 0) {
    payload.contrasena = pass;
  }

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
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo actualizar el usuario");
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = "Aplicar cambios";
  }
});


//Activar / desactivar desde modal

btnToggleUser.addEventListener("click", async () => {
  const id = btnToggleUser.dataset.id;
  const activoActual = Number(btnToggleUser.dataset.activo);

  const accion = activoActual === 1 ? "desactivar" : "activar";
  const confirmar = confirm(`¿Deseas ${accion} este usuario?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}/toggle`, {
      method: "PATCH",
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Error al cambiar estado");
    }

    alert(json.message || "Estado actualizado");
    closeModal();
    await cargarUsuarios();
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo cambiar el estado");
  }
});


//Inicialización

cargarUsuarios();
setInterval(cargarUsuarios, 5000);