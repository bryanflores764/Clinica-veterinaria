// ============================================================
//  Archivo: js/administrador/interfazAdmin.js
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

// ===== Acordeón del menú =====
const menuGroups = document.querySelectorAll(".menu-grupo");

function resetMenu() {
    menuGroups.forEach((group) => {
        group.classList.remove("open");
        const parent = group.querySelector(".item");
        if (parent) parent.classList.remove("active");
        group.querySelectorAll(".sub-item").forEach((s) => s.classList.remove("active"));
    });
}

menuGroups.forEach((group) => {
    const parentLink = group.querySelector(".item");
    const isOpen = () => group.classList.contains("open");

    parentLink.addEventListener("click", (e) => {
        e.preventDefault();
        const openBefore = isOpen();
        resetMenu();
        if (!openBefore) {
            group.classList.add("open");
            parentLink.classList.add("active");
        }
    });
});

// ===== Auto-selección por URL =====
const currentPage = window.location.pathname.split("/").pop();

menuGroups.forEach((group) => {
    const parentLink = group.querySelector(".item");
    const subItems = group.querySelectorAll(".sub-item");

    subItems.forEach((sub) => {
        const href = sub.getAttribute("href") || "";
        const hrefPage = href.split("/").pop();

        if (hrefPage === currentPage) {
            resetMenu();
            group.classList.add("open");
            parentLink.classList.add("active");
            sub.classList.add("active");
        }
    });
});

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