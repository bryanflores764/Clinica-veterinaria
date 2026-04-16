const API_URL = "http://localhost:3000/api/citas";

document.getElementById("formCita")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cita = {
    Id_Mascota: Number(document.getElementById("mascota").value),
    Id_Veterinario: Number(document.getElementById("veterinario").value),
    IdTipoConsulta: Number(document.getElementById("tipo").value),
    IdEstadoCita: 1, // pendiente
    FechaHora: document.getElementById("fecha").value
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cita)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("Cita creada correctamente ✅");

    // limpiar form
    document.getElementById("formCita").reset();

  } catch (error) {
    alert(error.message);
  }
});