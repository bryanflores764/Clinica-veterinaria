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

    const textoBoton = esActivo ? "Desactivar" : "Activar";
    const claseBoton = esActivo ? "btn-delete" : "btn-activate";

    return `
      <tr>
        <td>${escapeHtml(u.id)}</td>
        <td>${escapeHtml(u.Nombre_Usuario)}</td>
        <td>${escapeHtml(u.Correo)}</td>
        <td>${escapeHtml(u.Nombre_Rol)}</td>
        <td>${estadoBadge(u.activo)}</td>

        <td class="actions-col">
          <button class="btn btn-edit" type="button" disabled>Editar</button>
          <button class="btn ${claseBoton} btn-toggle" data-id="${u.id}">
            ${textoBoton}
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

// recarga en tiempo real cada 5 seg
setInterval(cargarUsuarios, 5000);
