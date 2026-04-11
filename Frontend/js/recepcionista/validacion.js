// ============================================================
// Archivo: js/recepcionista/validacion.js
// ============================================================

// URL base de la API
const API_URL = "http://localhost:3000";

// Elementos del DOM
const btnNuevoPropietario = document.getElementById("nuevo-propietario");
const modalOverlay = document.getElementById("modalOverlay");
const cerrarModalBtn = document.getElementById("cerrarModal");
const cancelarBtn = document.getElementById("cancelar");
const formNuevoPropietario = document.getElementById("formNuevoPropietario");

const nombreInput = document.getElementById("nombre");
const telefonoInput = document.getElementById("telefono");
const correoInput = document.getElementById("correo");
const direccionInput = document.getElementById("direccion");

const btnGuardar = formNuevoPropietario.querySelector(".btn-guardar");

// Obtener headers con token
function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem("token");

    return {
        ...extra,
        Authorization: `Bearer ${token}`,
    };
}

// Abrir modal
function abrirModal() {
    modalOverlay.classList.remove("hidden");
    nombreInput.focus();
}

// Cerrar modal
function cerrarModal() {
    modalOverlay.classList.add("hidden");
}

// Limpiar formulario
function limpiarFormulario() {
    formNuevoPropietario.reset();
}

// Eventos del modal
btnNuevoPropietario.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModal();
});

cerrarModalBtn.addEventListener("click", cerrarModal);
cancelarBtn.addEventListener("click", cerrarModal);

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        cerrarModal();
    }
});

// Evento submit del formulario
formNuevoPropietario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const correo = correoInput.value.trim();
    const direccion = direccionInput.value.trim();

    if (!nombre || !telefono || !correo || !direccion) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const payload = {
        nombre,
        telefono,
        correo,
        direccion
    };

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";

    try {
        const res = await fetch(`${API_URL}/api/propetarios`, {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo registrar el propietario");
        }

        alert(json.message || "Propietario registrado correctamente");
        limpiarFormulario();
        cerrarModal();

    } catch (error) {
        console.error("Error al registrar propietario:", error);
        alert(error.message || "Ocurrió un error al registrar el propietario");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar";
    }
});