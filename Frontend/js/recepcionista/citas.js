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

const modalCancelar = document.getElementById("modalCancelar");
const cerrarCancelar = document.getElementById("cerrarCancelar");
const confirmarCancelar = document.getElementById("confirmarCancelar");

const modalExito = document.getElementById("modalExito");
const cerrarExito = document.getElementById("cerrarExito");

const filtroEstado = document.getElementById("filtroEstado");

// ===============================
// DATA
// ===============================
const mascotas = [
  { id: 1, nombre: "Firulais" },
  { id: 2, nombre: "Michi" },
  { id: 3, nombre: "Rocky" }
];

let citas = [];
let citaCancelarId = null;

// ===============================
// DATA INICIAL
// ===============================
citas.push({
  id: 1,
  mascota: "Firulais",
  mascota_id: 1,
  fecha: "2024-05-20",
  hora: "10:00",
  estado: "Activa"
});

// ===============================
// FILTRO
// ===============================
filtroEstado?.addEventListener("change", () => {
  cargarCitas();
});

// ===============================
// 🔥 BOTÓN CITAS (FIX REAL)
// ===============================
document.getElementById("btnVerCitas").onclick = function (e) {
  e.preventDefault();

  const tabla = document.getElementById("contenedorTabla");
  const titulo = document.getElementById("tituloCitas");

  if (tabla) tabla.classList.remove("hidden");
  if (titulo) titulo.classList.remove("hidden");

  cargarCitas();
};

// ===============================
// MODAL NUEVA
// ===============================
btnNueva?.addEventListener("click", () => modal.classList.remove("hidden"));
cerrar?.addEventListener("click", () => modal.classList.add("hidden"));

// ===============================
// CARGAR MASCOTAS
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
// MODAL EXITO
// ===============================
function mostrarExito(mensaje) {
  modalExito.querySelector("p").textContent = mensaje;
  modalExito.classList.remove("hidden");
}

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
    hora,
    estado: "Activa"
  });

  modal.classList.add("hidden");
  form.reset();

  if (filtroEstado) filtroEstado.value = "todos";

  cargarCitas();
  mostrarExito("Cita creada correctamente");
});

// ===============================
// LISTAR
// ===============================
function cargarCitas() {
  const tabla = document.getElementById("tablaCitas");
  if (!tabla) return;

  tabla.innerHTML = "";

  const filtro = filtroEstado ? filtroEstado.value : "todos";

  citas.forEach(c => {

    if (filtro !== "todos" && c.estado !== filtro) return;

    let claseEstado = "";

    if (c.estado === "Activa") {
      claseEstado = "estado-activa";
    } 
    else if (c.estado === "Cancelada") {
      claseEstado = "estado-cancelada";
    } 
    else if (c.estado === "Pendiente") {
      claseEstado = "estado-pendiente";
    } 
    else if (c.estado === "En Curso") {
      claseEstado = "estado-curso";
    }

    tabla.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.mascota}</td>
        <td>${c.fecha}</td>
        <td>${c.hora}</td>
        <td>
          <span class="${claseEstado}">
            ${c.estado}
          </span>
        </td>
        <td>
          <button class="btn-editar" onclick="abrirEditar(${c.id})">Editar</button>
          <button class="btn-cancelar" onclick="abrirCancelar(${c.id})">Cancelar</button>
        </td>
      </tr>
    `;
  });
}

// ===============================
// EDITAR
// ===============================
window.abrirEditar = function(id) {
  const c = citas.find(x => x.id === id);

  document.getElementById("editIdCita").value = c.id;
  document.getElementById("editMascota").value = c.mascota_id;
  document.getElementById("editFecha").value = c.fecha;
  document.getElementById("editHora").value = c.hora;

  modalEditar.classList.remove("hidden");
};

cerrarEditar?.addEventListener("click", () => {
  modalEditar.classList.add("hidden");
});

formEditar?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("editIdCita").value);
  const mascota = document.getElementById("editMascota").value;
  const fecha = document.getElementById("editFecha").value;
  const hora = document.getElementById("editHora").value;

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
  mostrarExito("Datos actualizados");
});

// ===============================
// CANCELAR
// ===============================
window.abrirCancelar = function(id) {
  citaCancelarId = id;
  modalCancelar.classList.remove("hidden");
};

cerrarCancelar?.addEventListener("click", () => {
  modalCancelar.classList.add("hidden");
  document.getElementById("motivoCancelacion").value = "";
});

confirmarCancelar?.addEventListener("click", () => {
  const motivo = document.getElementById("motivoCancelacion").value;

  if (!motivo) {
    alert("Ingrese un motivo");
    return;
  }

  const index = citas.findIndex(c => c.id === citaCancelarId);

  if (index !== -1) {
    citas[index].estado = "Cancelada";
  }

  modalCancelar.classList.add("hidden");
  document.getElementById("motivoCancelacion").value = "";

  cargarCitas();
  mostrarExito("Cita cancelada");
});

// ===============================
cargarCitas();

});