// Selecciona todos los grupos del menú
const menuGroups = document.querySelectorAll(".menu-grupo");

// Cierra y desactiva todo
function resetMenu() {
  menuGroups.forEach((group) => {
    group.classList.remove("open");

    const parent = group.querySelector(".item");
    if (parent) parent.classList.remove("active");

    group.querySelectorAll(".sub-item").forEach((s) => s.classList.remove("active"));
  });
}

// Acordeón: click en padres abre/cierra (solo uno abierto)
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

// Nombre del archivo actual (ej: "crear-usuario.html")
const currentPage = window.location.pathname.split("/").pop();

// Recorremos sub-items y comparamos SOLO el nombre del archivo del href
menuGroups.forEach((group) => {
  const parentLink = group.querySelector(".item");
  const subItems = group.querySelectorAll(".sub-item");

  subItems.forEach((sub) => {
    const href = sub.getAttribute("href") || "";

    // Obtiene solo el nombre del archivo del href (por si viene con carpetas)
    const hrefPage = href.split("/").pop();

    if (hrefPage === currentPage) {
      resetMenu();

      group.classList.add("open");
      parentLink.classList.add("active");
      sub.classList.add("active");
    }
  });
});