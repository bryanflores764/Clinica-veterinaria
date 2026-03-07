// ============================================================
//  Archivo: js/veterinario/interfazVeterinario.js
// ============================================================

// ===== Protección de ruta =====
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "../../index.html";
}

// ===== Cerrar sesión =====
const cerrarSesion = document.querySelector('a[href="../../index.html"]');
if (cerrarSesion) {
    cerrarSesion.addEventListener("click", async function(e) {
        e.preventDefault();
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
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
        window.location.href = "../../index.html";
    });
}

// ===== Menú móvil =====
const toggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.sidebar-backdrop');

function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

if (toggle) {
    toggle.addEventListener('click', () => {
        const isOpen = document.body.classList.contains('menu-open');
        setMenu(!isOpen);
    });
}

if (backdrop) {
    backdrop.addEventListener('click', () => setMenu(false));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});