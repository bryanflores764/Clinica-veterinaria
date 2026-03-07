// ============================================================
//  Archivo: js/administrador/interfazAdmin.js
// ============================================================

//Saludo
// Saludo
const saludo = document.getElementById("saludo");
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

if (saludo && usuario && usuario.Nombre_Usuario) {
    saludo.textContent = `Bienvenido Administrador ${usuario.Nombre_Usuario}`;
}

//Proteccion de ruta 
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

//Crear boton hamburguesa y backdrop automáticamente
function crearElementosMenuMovil() {
    let toggle = document.querySelector(".menu-toggle");
    let backdrop = document.querySelector(".sidebar-backdrop");

    if (!toggle) {
        toggle = document.createElement("button");
        toggle.className = "menu-toggle";
        toggle.setAttribute("type", "button");
        toggle.setAttribute("aria-label", "Abrir menú");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "☰";
        document.body.appendChild(toggle);
    }

    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        document.body.appendChild(backdrop);
    }

    return { toggle, backdrop };
}

const { toggle, backdrop } = crearElementosMenuMovil();

//Cerrar sesion
const cerrarSesion = document.querySelector('a[href="../../index.html"]');
if (cerrarSesion) {
    cerrarSesion.addEventListener("click", async function(e) {
        e.preventDefault();

        const tokenActual = localStorage.getItem("token");

        try {
            if (tokenActual) {
                await fetch("http://localhost:3000/api/auth/logout", {
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

//Acordeon del menu
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

    if (parentLink) {
        parentLink.addEventListener("click", (e) => {
            e.preventDefault();
            const openBefore = isOpen();
            resetMenu();

            if (!openBefore) {
                group.classList.add("open");
                parentLink.classList.add("active");
            }
        });
    }
});

// Auto-seleccion por URL 
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

//Menu movil 
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
    backdrop.addEventListener("click", () => setMenu(false));
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        setMenu(false);
    }
});

// Cerrar menu al tocar subOpciones en móvil 
document.querySelectorAll(".sub-item").forEach((item) => {
    item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            setMenu(false);
        }
    });
});