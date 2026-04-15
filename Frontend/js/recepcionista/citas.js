document.addEventListener("DOMContentLoaded", () => {

// ===============================
// SELECTORES
// ===============================
const btnNueva = document.getElementById("btnNuevaCita");
const btnVerCitas = document.getElementById("btnVerCitas");
const modal = document.getElementById("modalCita");
const cerrar = document.getElementById("cerrarModal");
const form = document.getElementById("formCita");

const modalEditar = document.getElementById("modalEditarCita");
const cerrarEditar = document.getElementById("cerrarEditarModal");
const formEditar = document.getElementById("formEditarCita");

const modalExito = document.getElementById("modalExito");
const cerrarExito = document.getElementById("cerrarExito");

// ===============================
// DATA
// ===============================
const mascotas = [
  { id: 1, nombre: "Firulais" },
  { id: 2, nombre: "Michi" },
  { id: 3, nombre: "Rocky" }
];

let citas = [];

// ===============================
// BOTÓN CITAS
// ===============================
btnVerCitas?.addEventListener("click", (e) => {
  e.preventDefault();

  document.getElementById("contenedorTabla")?.classList.remove("hidden");
  document.getElementById("tituloCitas")?.classList.remove("hidden");

  cargarCitas();
});

// ===============================
// MODAL NUEVA CITA
// ===============================
btnNueva?.addEventListener("click", () => modal.classList.remove("hidden"));
cerrar?.addEventListener("click", () => modal.classList.add("hidden"));

// ===============================
// CARGAR SELECTS
// ===============================
function cargarMascotas() {
  const select = document.getElementById("mascota");
  const selectEdit = document.getElementById("editMascota");

  if (select) {
    select.innerHTML = '<option value="">Seleccione Mascota</option>';
    mascotas.forEach(m => {
      select.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });
  }

  if (selectEdit) {
    selectEdit.innerHTML = '<option value="">Seleccione Mascota</option>';
    mascotas.forEach(m => {
      selectEdit.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });
  }
}

cargarMascotas();

// ===============================
// MODAL ÉXITO (PERMANENTE)
// ===============================
function mostrarExito(mensaje) {
  const texto = modalExito.querySelector("p");
  const titulo = modalExito.querySelector("h3");

  if (texto) texto.textContent = mensaje;
  if (titulo) titulo.textContent = "Éxito";

  modalExito.classList.remove("hidden");
}

// cerrar con botón
cerrarExito?.addEventListener("click", () => {
  modalExito.classList.add("hidden");
});

// ===============================
// CREAR CITA
// ===============================
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const mascota = document.getElementById("mascota").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!mascota || !fecha || !hora) {
    alert("Complete todos los campos");
    return;
  }

  const mascotaObj = mascotas.find(m => m.id == mascota);

  citas.push({
    id: citas.length + 1,
    mascota: mascotaObj.nombre,
    mascota_id: mascota,
    fecha,
    hora
  });

  modal.classList.add("hidden");
  form.reset();

  cargarCitas();

  mostrarExito("Se ha registrado una nueva cita ");
});

// ===============================
// LISTAR CITAS
// ===============================
function cargarCitas() {
  const tabla = document.getElementById("tablaCitas");
  if (!tabla) return;

  tabla.innerHTML = "";

  citas.forEach(c => {
    tabla.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.mascota}</td>
        <td>${c.fecha}</td>
        <td>${c.hora}</td>
        <td>
          <button onclick="abrirEditar(${c.id})">Editar</button>
        </td>
      </tr>
    `;
  });
}

// ===============================
// ABRIR EDITAR
// ===============================
window.abrirEditar = function(id) {
  const c = citas.find(x => x.id === id);
  if (!c) return;

  document.getElementById("editIdCita").value = c.id;
  document.getElementById("editMascota").value = c.mascota_id;
  document.getElementById("editFecha").value = c.fecha;
  document.getElementById("editHora").value = c.hora;

  modalEditar.classList.remove("hidden");
};

// ===============================
// CERRAR EDITAR
// ===============================
cerrarEditar?.addEventListener("click", () => {
  modalEditar.classList.add("hidden");
});

// ===============================
// GUARDAR EDICIÓN
// ===============================
formEditar?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("editIdCita").value);
  const mascota = document.getElementById("editMascota").value;
  const fecha = document.getElementById("editFecha").value;
  const hora = document.getElementById("editHora").value;

  if (!mascota || !fecha || !hora) {
    alert("Complete todos los campos");
    return;
  }

  const mascotaObj = mascotas.find(m => m.id == mascota);
  const index = citas.findIndex(c => c.id === id);

  if (index !== -1) {
    citas[index] = {
      ...citas[index],
      mascota: mascotaObj.nombre,
      mascota_id: mascota,
      fecha,
      hora
    };
  }

  modalEditar.classList.add("hidden");
  cargarCitas();

  mostrarExito("Se han actualizado los datos correctamente ");
});

});