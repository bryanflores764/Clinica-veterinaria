// ============================================================
// Archivo: js/veterinario/interfazveterinario.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    protegerRuta();
    mostrarNombreUsuarioLogueado();
    configurarCerrarSesion();
    configurarMenuMovil();
});

// ============================================================
// Protección de ruta
// ============================================================
function protegerRuta() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../../index.html";
    }
}

// ============================================================
// Mostrar nombre del usuario logueado
// ============================================================
function mostrarNombreUsuarioLogueado() {
    const tituloBienvenida = document.getElementById("titulo-bienvenida");

    if (!tituloBienvenida) return;

    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        tituloBienvenida.textContent = "Bienvenido Veterinari@";
        return;
    }

    let usuario = null;

    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch (error) {
        usuario = usuarioGuardado;
    }

    const nombreUsuario = obtenerNombreUsuario(usuario);

    if (!nombreUsuario) {
        tituloBienvenida.textContent = "Bienvenido Veterinari@";
        return;
    }

    tituloBienvenida.textContent = `Bienvenido Veterinari@, ${nombreUsuario}`;
}

function obtenerNombreUsuario(usuario) {
    if (!usuario) return "";

    if (typeof usuario === "string") {
        return usuario.trim();
    }

    if (typeof usuario === "object") {
        return (
            usuario.Nombre_Usuario ||
            usuario.nombre_usuario ||
            usuario.nombreUsuario ||
            usuario.Nombre ||
            usuario.nombre ||
            usuario.usuario ||
            usuario.username ||
            usuario.Correo ||
            usuario.correo ||
            usuario.email ||
            ""
        ).trim();
    }

    return "";
}

// ============================================================
// Cerrar sesión
// ============================================================
function configurarCerrarSesion() {
    const btnLogout = document.getElementById("cerrar-sesion");

    if (!btnLogout) return;

    btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            await fetch(`${window.API_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        sessionStorage.clear();

        window.location.href = "../../index.html";
    });
}

// ============================================================
// Menú móvil
// ============================================================
function configurarMenuMovil() {
    const toggle = document.querySelector(".menu-toggle");
    const backdrop = document.querySelector(".sidebar-backdrop");

    function setMenu(open) {
        document.body.classList.toggle("menu-open", open);

        if (toggle) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        }
    }

    if (toggle) {
        toggle.addEventListener("click", () => {
            const isOpen = document.body.classList.contains("menu-open");
            setMenu(!isOpen);
        });
    }

    if (backdrop) {
        backdrop.addEventListener("click", () => {
            setMenu(false);
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            setMenu(false);
        }
    });
}