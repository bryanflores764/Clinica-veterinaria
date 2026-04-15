/*APARTADO DE RECEPCIONISTA DEL BUTTON NUEVA CITA*/
const btnNueva = document.getElementById("btnNuevaCita");
const modal = document.getElementById("modalCita");
const cerrar = document.getElementById("cerrarModal");

// Abrir modal
btnNueva.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.remove("hidden");
});

// Cerrar modal
cerrar.addEventListener("click", () => {
  modal.classList.add("hidden");
});


