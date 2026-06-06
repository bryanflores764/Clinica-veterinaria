// ============================================================
//  Archivo: js/administrador/crear-usuario.js
// ============================================================

const API_URL = "https://clinica-veterinaria-79jk.onrender.com";

const form               = document.getElementById("crearUsuarioForm");
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const contraseniaInput   = document.getElementById("contrasenia");
const rolInput           = document.getElementById("rol");
const correoInput        = document.getElementById("correo");
const btnCrear           = document.querySelector(".btn-crear");

function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return { ...extra, Authorization: `Bearer ${token}` };
}

function limpiarFormulario() {
    form.reset();
    rolInput.value = "";
    nombreUsuarioInput.focus();
}

// ── Toast ────────────────────────────────────────────────────
function mostrarToast(mensaje, tipo = "error") {
    document.querySelector(".vc-toast")?.remove();

    const config = {
        success: { color: "#2e7d6b", border: "#22c55e", icon: "✔" },
        error:   { color: "#c0392b", border: "#ef4444", icon: "✖" },
        warning: { color: "#b45309", border: "#f59e0b", icon: "⚠" },
    };

    const { color, border, icon } = config[tipo] ?? config.error;

    // Inyectar estilos solo una vez
    if (!document.getElementById("vc-toast-styles")) {
        const style = document.createElement("style");
        style.id = "vc-toast-styles";
        style.textContent = `
            .vc-toast {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px 20px;
                border-radius: 12px;
                border-left: 5px solid;
                background: #fff;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                max-width: 360px;
                font-family: 'Baloo Da 2', sans-serif;
                animation: vcSlideIn .3s ease;
            }
            .vc-toast-icon {
                font-size: 20px;
                font-weight: 700;
                flex-shrink: 0;
                margin-top: 1px;
            }
            .vc-toast-body p {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                line-height: 1.5;
            }
            .vc-toast.saliendo {
                animation: vcSlideOut .3s ease forwards;
            }
            @keyframes vcSlideIn {
                from { opacity: 0; transform: translateX(60px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes vcSlideOut {
                from { opacity: 1; transform: translateX(0); }
                to   { opacity: 0; transform: translateX(60px); }
            }
        `;
        document.head.appendChild(style);
    }

    const toast = document.createElement("div");
    toast.className = "vc-toast";
    toast.style.borderColor = border;
    toast.innerHTML = `
        <span class="vc-toast-icon" style="color:${color}">${icon}</span>
        <div class="vc-toast-body">
            <p>${mensaje}</p>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("saliendo");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ── Submit ───────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreUsuario = nombreUsuarioInput.value.trim();
    const contrasena    = contraseniaInput.value.trim();
    const rolId         = Number(rolInput.value);
    const correo        = correoInput.value.trim();

    if (!nombreUsuario || !contrasena || !rolId || !correo) {
        mostrarToast("Por favor completa todos los campos.", "warning");
        return;
    }

    const payload = { nombre_usuario: nombreUsuario, contrasena, rolId, correo };

    btnCrear.disabled     = true;
    btnCrear.textContent  = "Creando...";

    try {
        const res = await fetch(`${API_URL}/api/usuarios`, {
            method: "POST",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
            throw new Error(json.message || "No se pudo crear el usuario");
        }

        mostrarToast(json.message || "Usuario creado correctamente", "success");
        limpiarFormulario();

    } catch (error) {
        console.error("Error al crear usuario:", error);
        mostrarToast(error.message || "Ocurrió un error al crear el usuario", "error");
    } finally {
        btnCrear.disabled    = false;
        btnCrear.textContent = "Crear Usuario";
    }
});