const API_URL = "http://localhost:3000/api/citas";

// 🔥 CARGAR CITAS
async function cargarCitas() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById("tablaCitas");
    tbody.innerHTML = "";

    data.forEach(cita => {
      tbody.innerHTML += `
        <tr>
          <td>${cita.IdCita}</td>
          <td>${new Date(cita.FechaHora).toLocaleString()}</td>
          <td>${cita.Mascota}</td>
          <td>${cita.Veterinario}</td>
          <td>${cita.Tipo_Consulta}</td>
          <td>${cita.Estado}</td>
          <td>
            <button onclick="cancelarCita(${cita.IdCita})">Cancelar</button>
            <button onclick="eliminarCita(${cita.IdCita})">Eliminar</button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    alert(error.message);
  }
}

// 🔄 CANCELAR
window.cancelarCita = async (id) => {
  try {
    await fetch(`${API_URL}/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IdEstadoCita: 2 }) // 2 = cancelada
    });

    cargarCitas();
  } catch (error) {
    alert("Error al cancelar");
  }
};

// ❌ ELIMINAR
window.eliminarCita = async (id) => {
  if (!confirm("¿Eliminar cita?")) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    cargarCitas();
  } catch (error) {
    alert("Error al eliminar");
  }
};

// 🔥 cargar al iniciar
document.addEventListener("DOMContentLoaded", cargarCitas);