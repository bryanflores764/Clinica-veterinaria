import { validarOwner } from "./validators.js";

const form = document.querySelector("#formOwner");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    nombre: document.querySelector("#nombre").value,
    email: document.querySelector("#email").value,
    telefono: document.querySelector("#telefono").value
  };

  const errores = validarOwner(data);

  // Mostrar errores
  if (Object.keys(errores).length > 0) {
    console.log(errores);

    if (errores.nombre) alert(errores.nombre);
    if (errores.email) alert(errores.email);
    if (errores.telefono) alert(errores.telefono);

    return;
  }

  // todo está bien
  alert("Formulario válido 🚀");
});