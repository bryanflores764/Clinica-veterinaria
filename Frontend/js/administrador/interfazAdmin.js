// ============================================================
//  Archivo: js/administrador/interfazAdmin.js
// ============================================================

// Protección de ruta 
function verificarSesion() {
    const tokenActual = localStorage.getItem("token");
    if (!tokenActual) {
        window.location.replace("../../index.html");
    }
}

verificarSesion();

window.addEventListener("pageshow", function () {
    verificarSesion();
});

// Elementos del menú móvil
const toggle = document.getElementById("menuToggle");
const backdrop = document.getElementById("sidebarBackdrop");

// Cerrar sesión
const cerrarSesion = document.querySelector(".btn-cerrar-sesion");

if (cerrarSesion) {
    cerrarSesion.addEventListener("click", async function(e) {
        e.preventDefault();

        const tokenActual = localStorage.getItem("token");

        try {
            if (tokenActual) {
                await fetch("https://clinica-veterinaria-79jk.onrender.com/api/auth/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenActual}`
                    }
                });
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        document.body.classList.remove("menu-open");
        window.location.replace("../../index.html");
    });
}

// Acordeón del menú
const menuGroups = document.querySelectorAll(".menu-grupo");

function resetMenu() {
    menuGroups.forEach((group) => {
        group.classList.remove("open");

        const parent = group.querySelector(".item");
        if (parent) parent.classList.remove("active");

        group.querySelectorAll(".sub-item").forEach((s) => {
            s.classList.remove("active");
        });
    });
}

menuGroups.forEach((group) => {
    const parentLink = group.querySelector(".item");
    const submenu = group.querySelector(".submenu");

    if (parentLink) {
        parentLink.addEventListener("click", (e) => {
            if (!submenu) {
                return;
            }

            e.preventDefault();

            const openBefore = group.classList.contains("open");

            resetMenu();

            if (!openBefore) {
                group.classList.add("open");
                parentLink.classList.add("active");
            }
        });
    }
});

// Auto-selección por URL 
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

            if (parentLink) parentLink.classList.add("active");

            sub.classList.add("active");
        }
    });
});

// Menú móvil 
function setMenu(open) {
    document.body.classList.toggle("menu-open", open);

    if (toggle) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.innerHTML = open ? "✕" : "☰";
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

// Cerrar menú al tocar subopciones en móvil 
document.querySelectorAll(".sub-item").forEach((item) => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            setMenu(false);
        }
    });
});









/*FUNCIONAMIENTO DE REPORTES*/
const btnReportesVentas = document.getElementById('btnReportesVentas');
const modalReportesVentas = document.getElementById('modalReportesVentas');
const cerrarModalReportes = document.getElementById('cerrarModalReportes');

if (btnReportesVentas && modalReportesVentas && cerrarModalReportes) {
    btnReportesVentas.addEventListener('click', function (event) {
        event.preventDefault();
        modalReportesVentas.classList.add('activo');
    });

    cerrarModalReportes.addEventListener('click', function () {
        modalReportesVentas.classList.remove('activo');
    });

    modalReportesVentas.addEventListener('click', function (event) {
        if (event.target === modalReportesVentas) {
            modalReportesVentas.classList.remove('activo');
        }
    });
}