// URL base de tu API
const API_URL = "http://localhost:3000";

//formulario
const form = document.getElementById("crearUsuarioForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
  //valores del form
    const nombre_usuario = document.getElementById("nombreUsuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasenia").value.trim();
    const rolId = Number(document.getElementById("rol").value);

  //armar el body exacto como lo pide la API
    const payload = { nombre_usuario, correo, contrasena, rolId };

    try {
        //Hacer POST a la API
        const res = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    //manejo de las respuestas
    if (!res.ok) {
        alert(data.message || "Error al crear usuario");
        return;
    }

    alert(data.message || "Usuario creado exitosamente");

    //limpiar form
    form.reset();
} catch (error) {
    console.error(error);
    alert(
        "No se pudo conectar con el servidor (backend). Verifica que esté corriendo.",
    );
}
});
