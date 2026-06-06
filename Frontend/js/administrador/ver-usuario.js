// ============================================================
//  Archivo: js/administrador/ver-usuario.js
// ============================================================

const API_URL = "https://clinica-veterinaria-79jk.onrender.com";

const tbody      = document.getElementById("users-tbody");
const emptyMsg   = document.getElementById("empty-msg");
const searchInput = document.getElementById("search");

let usuariosCache = [];

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...extra, Authorization: `Bearer ${token}` };
}

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
            <button class="btn btn-edit btn-open-edit" type="button"
              data-id="${escapeHtml(u.id)}"
              data-usuario="${escapeHtml(u.Nombre_Usuario)}"
              data-correo="${escapeHtml(u.Correo)}"
              data-rolnombre="${escapeHtml(u.Nombre_Rol)}"
              data-activo="${escapeHtml(u.activo)}"
            >Editar</button>
            <button class="btn btn-delete btn-delete-user" type="button"
              data-id="${escapeHtml(u.id)}"
              data-usuario="${escapeHtml(u.Nombre_Usuario)}"
            >Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function aplicarFiltro() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { renderUsuarios(usuariosCache); return; }

  const filtrados = usuariosCache.filter((u) => {
    return (u.Nombre_Usuario ?? "").toLowerCase().includes(q)
        || (u.Correo       ?? "").toLowerCase().includes(q)
        || (u.Nombre_Rol   ?? "").toLowerCase().includes(q);
  });

  renderUsuarios(filtrados);
}

async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/api/usuarios`, { headers: getAuthHeaders() });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.replace("../../index.html");
      return;
    }

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || "Error al obtener usuarios");

    usuariosCache = Array.isArray(json.data) ? json.data : [];
    aplicarFiltro();
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    usuariosCache = [];
    renderUsuarios([]);
    emptyMsg.style.display = "block";
    emptyMsg.textContent   = "No se pudo cargar usuarios.";
  }
}

searchInput.addEventListener("input", aplicarFiltro);

// ── Toast ────────────────────────────────────────────────────
function mostrarToast(mensaje, tipo = "error") {
  document.querySelector(".vc-toast")?.remove();

  const config = {
    success: { color: "#2e7d6b", border: "#22c55e", icon: "✔" },
    error:   { color: "#c0392b", border: "#ef4444", icon: "✖" },
    warning: { color: "#b45309", border: "#f59e0b", icon: "⚠" },
  };

  const { color, border, icon } = config[tipo] ?? config.error;

  if (!document.getElementById("vc-toast-styles")) {
    const style = document.createElement("style");
    style.id = "vc-toast-styles";
    style.textContent = `
      .vc-toast {
        position: fixed; top: 24px; right: 24px; z-index: 9999;
        display: flex; align-items: flex-start; gap: 12px;
        padding: 16px 20px; border-radius: 12px; border-left: 5px solid;
        background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.12);
        max-width: 360px; font-family: 'Baloo Da 2', sans-serif;
        animation: vcSlideIn .3s ease;
      }
      .vc-toast-icon { font-size: 20px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
      .vc-toast-body p { margin: 0; font-size: 14px; font-weight: 500; color: #1e293b; line-height: 1.5; }
      .vc-toast.saliendo { animation: vcSlideOut .3s ease forwards; }
      @keyframes vcSlideIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
      @keyframes vcSlideOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(60px); } }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement("div");
  toast.className = "vc-toast";
  toast.style.borderColor = border;
  toast.innerHTML = `
    <span class="vc-toast-icon" style="color:${color}">${icon}</span>
    <div class="vc-toast-body"><p>${mensaje}</p></div>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("saliendo");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Modal de confirmación (reemplaza confirm()) ───────────────
function mostrarConfirm(mensaje, onConfirmar) {
  document.querySelector(".vc-confirm-overlay")?.remove();

  if (!document.getElementById("vc-confirm-styles")) {
    const style = document.createElement("style");
    style.id = "vc-confirm-styles";
    style.textContent = `
      .vc-confirm-overlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0,0,0,.45);
        display: flex; align-items: center; justify-content: center;
        animation: vcFadeIn .2s ease;
      }
      .vc-confirm-box {
        background: #fff; border-radius: 14px;
        padding: 28px 28px 20px; max-width: 380px; width: 90%;
        box-shadow: 0 12px 40px rgba(0,0,0,.18);
        font-family: 'Baloo Da 2', sans-serif;
        animation: vcPopIn .25s ease;
      }
      .vc-confirm-box p { margin: 0 0 22px; font-size: 15px; color: #1e293b; line-height: 1.5; }
      .vc-confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }
      .vc-confirm-actions button {
        padding: 8px 20px; border-radius: 8px; border: none;
        font-family: 'Baloo Da 2', sans-serif; font-size: 14px;
        font-weight: 600; cursor: pointer; transition: opacity .15s;
      }
      .vc-confirm-actions button:hover { opacity: .85; }
      .vc-btn-cancel-confirm { background: #f1f5f9; color: #475569; }
      .vc-btn-ok-confirm      { background: #ef4444; color: #fff;     }
      @keyframes vcFadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes vcPopIn  { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement("div");
  overlay.className = "vc-confirm-overlay";
  overlay.innerHTML = `
    <div class="vc-confirm-box">
      <p>${mensaje}</p>
      <div class="vc-confirm-actions">
        <button class="vc-btn-cancel-confirm">Cancelar</button>
        <button class="vc-btn-ok-confirm">Confirmar</button>
      </div>
    </div>
  `;

  overlay.querySelector(".vc-btn-cancel-confirm").addEventListener("click", () => overlay.remove());
  overlay.querySelector(".vc-btn-ok-confirm").addEventListener("click", () => {
    overlay.remove();
    onConfirmar();
  });

  document.body.appendChild(overlay);
}

// ── Modal de edición ─────────────────────────────────────────
const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 3, nombre: "Recepcionista" },
  { id: 2, nombre: "Veterinario" },
];

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
        <button class="btn btn-save"   type="submit"  id="btnSaveEdit">Aplicar cambios</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(modalOverlay);

const editForm       = document.getElementById("editUserForm");
const btnCancelEdit  = document.getElementById("btnCancelEdit");
const btnClose       = modalOverlay.querySelector(".modal-close");
const btnToggleUser  = document.getElementById("btnToggleUser");
const editId         = document.getElementById("editId");
const editNombre     = document.getElementById("editNombre");
const editCorreo     = document.getElementById("editCorreo");
const editContrasena = document.getElementById("editContrasena");
const editRol        = document.getElementById("editRol");

function openModal()  { modalOverlay.classList.add("show"); setTimeout(() => editNombre.focus(), 0); }
function closeModal() {
  modalOverlay.classList.remove("show");
  editForm.reset();
  editId.value = "";
  btnToggleUser.dataset.id    = "";
  btnToggleUser.dataset.activo = "";
  btnToggleUser.textContent   = "Desactivar usuario";
}

function fillRolesSelect(selectedRolNombre) {
  editRol.innerHTML = ROLES.map((r) => {
    const selected = r.nombre.toLowerCase() === (selectedRolNombre ?? "").toLowerCase() ? "selected" : "";
    return `<option value="${r.id}" ${selected}>${r.nombre}</option>`;
  }).join("");
  if (!editRol.value && ROLES.length) editRol.value = String(ROLES[0].id);
}

modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
btnCancelEdit.addEventListener("click", closeModal);
btnClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) closeModal();
});

// ── Abrir modal de edición ───────────────────────────────────
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-open-edit");
  if (!btn) return;

  editId.value        = btn.dataset.id;
  editNombre.value    = btn.dataset.usuario  ?? "";
  editCorreo.value    = btn.dataset.correo   ?? "";
  editContrasena.value = "";

  fillRolesSelect(btn.dataset.rolnombre);

  btnToggleUser.dataset.id    = btn.dataset.id;
  btnToggleUser.dataset.activo = btn.dataset.activo;
  btnToggleUser.textContent   = Number(btn.dataset.activo) === 1 ? "Desactivar usuario" : "Activar usuario";

  openModal();
});

// ── Guardar cambios ──────────────────────────────────────────
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id      = editId.value;
  const btnSave = document.getElementById("btnSaveEdit");

  const payload = {
    nombre_usuario: editNombre.value.trim(),
    correo:         editCorreo.value.trim(),
    rolId:          Number(editRol.value),
  };

  const pass = editContrasena.value.trim();
  if (pass.length > 0) payload.contrasena = pass;

  btnSave.disabled    = true;
  btnSave.textContent = "Guardando...";

  try {
    const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
      method:  "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body:    JSON.stringify(payload),
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.replace("../../index.html");
      return;
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.message || `Error HTTP ${res.status}`);

    mostrarToast(json.message || "Usuario actualizado correctamente", "success");
    closeModal();
    await cargarUsuarios();
  } catch (error) {
    console.error(error);
    mostrarToast(error.message || "No se pudo actualizar el usuario", "error");
  } finally {
    btnSave.disabled    = false;
    btnSave.textContent = "Aplicar cambios";
  }
});

// ── Eliminar usuario ─────────────────────────────────────────
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete-user");
  if (!btn) return;

  const { id, usuario } = btn.dataset;

  mostrarConfirm(`¿Deseas eliminar al usuario <strong>${escapeHtml(usuario)}</strong>?`, async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method:  "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.replace("../../index.html");
        return;
      }

      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Error al eliminar");

      mostrarToast(json.message || "Usuario eliminado correctamente", "success");
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarToast(error.message || "No se pudo eliminar el usuario", "error");
    }
  });
});

// ── Activar / Desactivar usuario ─────────────────────────────
btnToggleUser.addEventListener("click", () => {
  const id          = btnToggleUser.dataset.id;
  const activoActual = Number(btnToggleUser.dataset.activo);
  const accion      = activoActual === 1 ? "desactivar" : "activar";

  mostrarConfirm(`¿Deseas <strong>${accion}</strong> este usuario?`, async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}/toggle`, {
        method:  "PATCH",
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.replace("../../index.html");
        return;
      }

      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Error al cambiar estado");

      mostrarToast(json.message || "Estado actualizado correctamente", "success");
      closeModal();
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarToast(error.message || "No se pudo cambiar el estado", "error");
    }
  });
});

// ── Init ─────────────────────────────────────────────────────
cargarUsuarios();
setInterval(cargarUsuarios, 5000);