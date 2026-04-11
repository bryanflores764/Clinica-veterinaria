// validators.js

export function validarOwner(data) {
  let errores = {};

  // Validar nombre
  if (!data.nombre || data.nombre.trim() === "") {
    errores.nombre = "El nombre es obligatorio";
  } else if (data.nombre.length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres";
  }

  // Validar email
  if (!data.email || data.email.trim() === "") {
    errores.email = "El email es obligatorio";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errores.email = "Formato de email inválido";
  }

  // Validar teléfono
  if (!data.telefono || data.telefono.trim() === "") {
    errores.telefono = "El teléfono es obligatorio";
  } else if (!/^[0-9]{8}$/.test(data.telefono)) {
    errores.telefono = "El teléfono debe tener 8 dígitos";
  }

  return errores;
}